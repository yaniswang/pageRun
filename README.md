pageRun
=======================

![pageRun logo](https://raw.github.com/yaniswang/pageRun/master/img/logo.png)

[![NPM version](https://badge.fury.io/js/pagerun.png)](http://badge.fury.io/js/pagerun)

pageRun is a webpage runner, used for webpage analysis.

It support a lot of plugins, you can also develop your own plugin upload to npm.

![pageRun screenshot](https://raw.github.com/yaniswang/pageRun/master/img/screenshot.png)

Features
=======================

1. Support http & https.
2. Support much of browsers with webdriver, such as: ie, chrome, firefox, android, ios.
3. Powerful plugin system on npm.
4. Easy to develop plugin.
5. Easy to use.

Install
=======================

1. Install Nodejs
    
    [http://nodejs.org/](http://nodejs.org/)

2. Download webdriver.

    [http://code.google.com/p/selenium/downloads/list](http://code.google.com/p/selenium/downloads/list)

    Chrome & ie must download chromeDriver & IEDriverServer.

    Tip: Add the directory to PATH, so you can use it.

3. Install pagerun from npm

        npm install pagerun

4. Install plugins from npm

        npm install pagerun-httpsummary
        npm install pagerun-httperror
        npm install pagerun-jserror
        npm install pagerun-pagesummary
        npm install pagerun-jsunit
        npm install pagerun-htmlhint

Usage
=======================

1. Run selenium server

        java -jar selenium-server-standalone-2.41.0.jar

2. Run pagerun

        var pagerun = require('pagerun');

        pagerun.loadNpmPlugin('httpsummary');
        pagerun.loadNpmPlugin('httperror');
        pagerun.loadNpmPlugin('jserror');
        pagerun.loadNpmPlugin('pagesummary');
        pagerun.loadNpmPlugin('jsunit');
        pagerun.loadNpmPlugin('htmlhint');

        pagerun.setConfig({
            pageproxy: {
                keyPath: "./cert/"
            },
            webdriver: {
                browserName: 'chrome',
                browserVersion: '',
                url: 'http://www.baidu.com/',
                loginUrl: '',
                loginPreClick: '',
                loginParams: {
                    'username': 'xxx',
                    'password': 'xxx'
                },
                loginButton: 'doLogin',
                scrollToEnd: true,
                screenshot: false
            },
            hosts: 'www.alibaba.com www.baidu.com',
            htmlhint: {
                "doctype-first": true,
                "spec-char-escape": true,
                "tag-pair": true,
                "id-unique": true,
                "src-not-empty": true,
            }
        });
        pagerun.mode = 'test';
        pagerun.run(function(result){
            console.log(result.success);
            console.log(JSON.stringify(result.messages,null,4));
            // console.log(result.logs);
            process.exit(0);
        });

API
==================

pagerun.loadNpmPlugin(pluginName)
----------------------------   

Load plugin from npm.

Npm plugin name must match: pagerun-xxx (pluginName == xxx)

pagerun.setConfig(configs)
----------------------------  

Set config for all plugins.

pagerun.mode
----------------------------  

Set run mode: 

    product: default mode, no log output.
    test: show logs
    debug: show logs and stop run after webdriver open url.

pagerun.modulesRoot
----------------------------

Set default modules root, default: ./node_modules/

This propertie can used for npm plugin develop.

pagerun.run(callback)
----------------------------  

Start pagerun task.

The first argument is the task callback. It will set result object to the callback:

1. result.success: true(success), false(failed)
2. result.messages: task results
3. result.logs: task logs

Core plugins
==================

All core plugins will loaded with pagerun task.

1. [pageproxy](https://github.com/yaniswang/pageRun/wiki/pageproxy)
    
    The plugin is used for read and edit http request.

2. [hosts](https://github.com/yaniswang/pageRun/wiki/hosts)

    The plugin is used for Change hosts.

3. [webdriver](https://github.com/yaniswang/pageRun/wiki/webdriver)

    Control webdriver to open target url.

4. [inject](https://github.com/yaniswang/pageRun/wiki/inject)

    Inject code to webpage.

5. [bridge](https://github.com/yaniswang/pageRun/wiki/bridge)

    Set pagerun object to browser.

    So you can use pagerun.error('jserror', {'text':'abc'}) in browser.

Npm plugins
===================

All npm plugins can loaded by pagerun.loadNpmPlugin api.

1. [httperror](https://www.npmjs.org/package/pagerun-httperror)
    
    Catch all http error such as:4xx, 5xx.

2. [htmlhint](https://www.npmjs.org/package/pagerun-htmlhint)
    
    Lint html content with HtmlHint.

3. [httpresponse](https://www.npmjs.org/package/pagerun-httpresponse)

    Save all http response content, so you can analyze the http content after run.

4. [httpsummary](https://www.npmjs.org/package/pagerun-httpsummary)

    Save http summary for pagerun.

5. [pagesummary](https://www.npmjs.org/package/pagerun-pagesummary)

    Get page summary in webpage, such as: dom time, dom count.

6. [jserror](https://www.npmjs.org/package/pagerun-jserror)

    Catch onerror info.

7. [jsunit](https://www.npmjs.org/package/pagerun-jsunit)

    Catch js unit test result, supoort: [Mocha](http://visionmedia.github.io/mocha/), [Jasmine](http://jasmine.github.io/), [QUnit](https://qunitjs.com/), [YUI Test](http://yuilibrary.com/projects/yuitest/).

8. [jscoverage](https://www.npmjs.org/package/pagerun-jscoverage)

    Get coverage info after js run.

License
================

paegRun is released under the MIT license:

> The MIT License
>
> Copyright (c) 2014 Yanis Wang \< yanis.wang@gmail.com \>
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.

Thanks
================

* GitHub: [https://github.com/](https://github.com/)