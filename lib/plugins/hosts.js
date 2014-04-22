
module.exports = function(pagerun){
    var self = this;
    pagerun.on('proxyStart', function(msg){
        var strHosts = self.config('');
        var mapHosts = getMapHosts(strHosts);
        var proxy = msg.proxy;
        proxy.addFilter(function(httpData, next){
            var newHost = mapHosts[httpData.hostname];
            if(newHost !== undefined){
                httpData.hostname = newHost;
            }
            next();
        });
    });
};

// get map from string hosts
function getMapHosts(strHosts){
    var arrLines = strHosts.split(/\r?\n/),
        line, match;
    var mapHosts = {};
    arrLines.forEach(function(line){
        match = line.match(/^\s*([^\s#]+)\s+([^#]+)/);
        if(match){
            match[2].split(/\s+/).forEach(function(host){
                if(host){
                    mapHosts[host.toLowerCase()] = match[1];
                }
            });
        }
    });
    return mapHosts;
}