var fs = require('fs');

module.exports = function(pagerun){
    var self = this;
    pagerun.on('proxyStart', function(msg){
        var proxy = msg.proxy;
        var bridgeJsonContent = fs.readFileSync(__dirname+'/bridge-json.js');
        var bridgeClientContent = fs.readFileSync(__dirname+'/bridge-client.js');
        proxy.addFilter(function(httpData, next, end){
            var responseContent = httpData.responseContent;
            if(httpData.responseCode === 200 &&
                httpData.responseType === 'html' &&
                responseContent !== undefined){
                httpData.responseContent = responseContent.replace(/<head(\s+[^<>]*)?>/i, '$&<script type="text/javascript" src="'+httpData.protocol+'//pagerun/json.js" charset="utf-8"></script><script type="text/javascript" src="'+httpData.protocol+'//pagerun/bridge.js" charset="utf-8"></script>');
            }
            else if(httpData.type === 'request' && httpData.hostname === 'pagerun'){
                switch(httpData.path){
                    case '/json.js':
                        httpData.responseCode = '200';
                        httpData.responseHeaders = {
                            'Content-Type': 'application/javascript'
                        };
                        httpData.responseData = bridgeJsonContent;
                        break;
                    case '/bridge.js':
                        httpData.responseCode = '200';
                        httpData.responseHeaders = {
                            'Content-Type': 'application/javascript'
                        };
                        httpData.responseData = bridgeClientContent;
                        break;
                }
                if(httpData.responseCode){
                    return end();
                }
            }
            next();
        }, true);
    });
};