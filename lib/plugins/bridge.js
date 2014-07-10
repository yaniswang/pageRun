var fs = require('fs');

module.exports = function(pagerun){
    var self = this;
    var config = self.config({});
    pagerun.injectCodeBefore('<script src="//pagerun/bridge.js"></script>', 'top');
    pagerun.injectCodeBefore('<script src="//pagerun/json.js"></script>', 'top');
    pagerun.addRequestMap('pagerun/json.js', {
        'responseCode': '200',
        'responseHeaders': {
            'Content-Type': 'application/javascript'
        },
        'responseData': fs.readFileSync(__dirname+'/bridge-json.js')
    });
    var clientCode = fs.readFileSync(__dirname+'/bridge-client.js').toString();
    var delayDefaultEnd = config.delayDefaultEnd || 0;
    clientCode = clientCode.replace('$delayDefaultEnd', delayDefaultEnd);
    pagerun.addRequestMap('pagerun/bridge.js', {
        'responseCode': '200',
        'responseHeaders': {
            'Content-Type': 'application/javascript'
        },
        'responseData': clientCode
    });
};