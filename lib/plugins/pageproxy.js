var pageproxy = require('pageproxy');
var fs = require('fs');

module.exports = function(pagerun){
    var self = this;
    // start proxy
    pagerun.on('runStart', function(){
        var httpPort;
        var config = self.config({
            port: 0,
            gunzip: false,
            keyPath: ''
        });
        var keyPath = config.keyPath;
        if(keyPath && fs.existsSync(keyPath) === false){
            self.log('error', 'keyPath not existed: ' + keyPath);
            process.exit();
        }
        var proxy = pageproxy.createServer(config);
        proxy.on('httpReady', function(msg){
            httpPort = msg.port;
        });
        proxy.on('ready', function(msg){
            self.log('start', httpPort);
            pagerun.emit('proxyStart', {
                proxy: proxy,
                port: httpPort
            });
        });
        proxy.on('request', function(msg){
            self.log('request', msg.url);
        });
        proxy.on('error', function(msg){
            var strMsg = {
                'url': msg.url,
                'type': msg.type,
                'info': msg.info.toString()
            };
            self.error(strMsg);
            self.log('error', strMsg);
        });
        proxy.listen(config.port);
        // close proxy
        pagerun.on('webdriverEnd', function(){
            if(proxy){
                proxy.close();
                self.log('end');
                pagerun.emit('proxyEnd');
            }
        });
    });
};