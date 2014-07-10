var JWebDriver = require('jwebdriver');

module.exports = function(pagerun){
    var self = this;
    var proxyPort;
    var config;
    var retryCount = 0;
    pagerun.on('proxyStart', function(msg){
        proxyPort = msg.port;
        config = self.config({
            wdHost: '127.0.0.1',
            wdPort: 4444,
            browserName: 'chrome',
            browserVersion: '',
            url: '',
            loginUrl: '',
            loginPreClick: '',
            loginParams: {},
            loginButton: '',
            scrollToEnd: false,
            screenshot: false,
            timeout: 60000,
            retry: 3
        });
        self.log('start');
        pagerun.emit('webdriverStart');
        openUrl(openCallback);
    });

    function openCallback(errorMessage){
        if(errorMessage !== null){
            if(errorMessage === 'webdriverError' && retryCount < config.retry ){
                retryCount ++;
                self.log('retry', retryCount);
                return setTimeout(function(){
                    openUrl(openCallback);
                },500);
            }
            self.error(errorMessage);
        }
        self.log('end');
        pagerun.emit('webdriverEnd', errorMessage === null);
    }

    function openUrl(endCallback){
        var wdHost = config.wdHost;
        var wdPort = config.wdPort;
        var browserName = config.browserName;
        var browserVersion = config.browserVersion;
        var url = config.url;
        var loginUrl = config.loginUrl;
        var loginPreClick = config.loginPreClick;
        var loginParams = config.loginParams;
        var loginButton = config.loginButton;
        var scrollToEnd = config.scrollToEnd;
        var screenshot = config.screenshot;
        var timeout = config.timeout;

        var _timer;
        var errorMessage = null;

        //初始化jWebDriver
        JWebDriver.config({
            'logMode': 'silent',
            'host': wdHost,
            'port': wdPort
        });
        var proxyHost = pagerun.localIp + ':' + proxyPort;
        var wdOpions = {
            'browserName': browserName,
            'proxy': {
                'proxyType': 'manual',
                'httpProxy': proxyHost,
                'sslProxy': proxyHost
            }
        };
        if(browserVersion !== undefined){
            wdOpions.version = browserVersion;
        }
        var wd = new JWebDriver(wdOpions, function(err){
            errorMessage = 'webdriverError';
            self.log('webdriverError', err);
            endWebdriver();
        });
        //初始化
        wd.run(function(browser, $){
            //运行超时
            _timer = setTimeout(function(){
                wd.end();
                errorMessage = 'timeout';
                self.log('timeout');
                endWebdriver();
            }, timeout);
            //异步超时时间
            browser.setTimeout('ascript', timeout - 20000);
            browser.maximize();
            browser.sleep(200);
        });
        // 登录用户
        if(loginUrl !== ''){
            wd.run(function(browser, $){
                self.log('login', loginUrl);
                browser.url(loginUrl);
                var arrKeys = Object.keys(loginParams),
                    firstId = arrKeys[0],
                    formId, formValue;
                var firstItem = browser.waitFor('#'+firstId, 30000);
                if(browser.isError(firstItem)){
                    //登录页面打开失败
                    errorMessage = 'loginUrlOpenFailed';
                    self.log('loginUrlOpenFailed');
                    return;
                }
                if(loginPreClick !== ''){
                    $('#'+loginPreClick).click();
                }
                for(var i=0,c=arrKeys.length;i<c;i++){
                    formId = arrKeys[i];
                    formValue = loginParams[formId];
                    $('#'+formId).val(formValue);
                }
                //延迟500毫秒再按回车，等待登录初始化
                browser.sleep(500);
                if(loginButton !== ''){
                    $('#'+loginButton).click();
                }
                else{
                    $('#'+formId).sendKeys('{enter}');
                }
                firstItem = browser.waitFor('#'+firstId, false, 30000);
                if(browser.isOk(firstItem)){
                    //如果登录表单还存在，则登录失败
                    errorMessage = 'loginFailed';
                    self.log('loginFailed', loginParams);
                    return;
                }
                self.log('loginSuccess');
                browser.url('about:blank');//clear browser
                browser.sleep(1000);
            });
        }
        wd.run(function(browser, $){
            if(errorMessage !== null){
                return;
            }
            self.log('openUrl', url);
            pagerun.emit('webdriverOpenUrl');
            browser.url(url);
            if(scrollToEnd){
                browser.exec('var callback = arguments[arguments.length-1];var doc = document.documentElement,body = document.body;var viewHeight = window.innerHeight || (doc && doc.clientHeight) || body.clientHeight;var nextScroll = viewHeight;function scrollToNextPage(){window.scrollTo(0,nextScroll);nextScroll += viewHeight;if(nextScroll < document.body.clientHeight){setTimeout(scrollToNextPage, 500);}else{window.scrollTo(0,0);setTimeout(callback,1000);}};window.scrollTo(0,0);setTimeout(scrollToNextPage, 500);', true);    
            }
            if(pagerun.mode === 'debug'){
                self.log('debugMode', 'stoped by debug mode');
                return;
            }
            var arrPageResults = browser.exec('var callback = arguments[arguments.length-1];if(window.pagerun){if(pagerun.isEnd){callback(pagerun.getResult(true));}else{pagerun.on("end",function(){callback(pagerun.getResult(true));});}}else{callback("[]");}', true);
            if(browser.isOk(arrPageResults)){
                try{
                    arrPageResults = JSON.parse(arrPageResults);
                    arrPageResults.forEach(function(result){
                        pagerun.result(result.type, result.module, result.message);
                    });
                }
                catch(e){}
            }
            else{
                self.log('getPageResultFailed', arrPageResults && arrPageResults.value.message);
            }
            if(screenshot === true){
                var base64 = browser.getScreenshot();
                self.info({
                    type: 'screenshot',
                    content: base64
                });
            }
        });
        // end wd
        wd.run(endWebdriver);
        function endWebdriver(browser, $){
            if(pagerun.mode === 'debug'){
                return;
            }
            if(browser){
                browser.end();
            }
            clearTimeout(_timer);
            endCallback(errorMessage);
        }
    }
};