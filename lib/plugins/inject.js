
module.exports = function(pagerun){
    var self = this;
    var config = self.config({});
    var arrTop = [];
    var arrHeader = [];
    var arrBody = [];
    var arrFooter = [];
    if(config.top){
        arrTop.push(config.top);
    }
    if(config.header){
        arrHeader.push(config.header);
    }
    if(config.body){
        arrBody.push(config.body);
    }
    if(config.footer){
        arrFooter.push(config.footer);
    }
    var bOpenUrl = false;
    // insert js at the first
    pagerun.injectCodeBefore = function(code, pos){
        switch(pos){
            case 'top':
                arrTop.unshift(code);
                break;
            case 'header':
                arrHeader.unshift(code);
                break;
            case 'body':
                arrBody.unshift(code);
                break;
            case 'footer':
                arrFooter.unshift(code);
                break;
        }
    }
    // append js at the end
    pagerun.injectCode = function(code, pos){
        switch(pos){
            case 'top':
                arrTop.push(code);
                break;
            case 'header':
                arrHeader.push(code);
                break;
            case 'body':
                arrBody.push(code);
                break;
            case 'footer':
                arrFooter.push(code);
                break;
        }
    }
    pagerun.on('proxyStart', function(msg){
        var proxy = msg.proxy;
        proxy.addFilter(function(httpData, next){
            if(bOpenUrl === true){
                var responseContent = httpData.responseContent;
                if(httpData.responseCode === 200 &&
                    httpData.responseType === 'html' &&
                    responseContent !== undefined){
                    var codeTop = arrTop.join('');
                    var codeHeader = arrHeader.join('');
                    var codeBody = arrBody.join('');
                    var codeFooter = arrFooter.join('');
                    if(codeTop){
                        responseContent = responseContent.replace(/<head(\s+[^<>]*)?>/i, '$&'+codeTop);
                    }
                    if(codeHeader){
                        responseContent = responseContent.replace(/<\/head>/i, codeHeader+'$&');
                    }
                    if(codeBody){
                        responseContent = responseContent.replace(/<body(\s+[^<>]*)?>/i, '$&'+codeBody);
                    }
                    if(codeFooter){
                        responseContent = responseContent.replace(/<\/body>/i, codeFooter+'$&');
                    }
                    httpData.responseContent = responseContent;
                }
            }
            next();
        });
    });
    pagerun.on('webdriverOpenUrl', function(){
        bOpenUrl = true;
    });
};
