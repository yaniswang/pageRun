var path = require('path');
var EventEmitterPrototype = require('events').EventEmitter.prototype;
var colors = require('colors');
var utils = require('./utils');
var extend = utils.extend;
var dateFormat = utils.dateFormat;

var pagerun = {};

pagerun.mode = 'product'; // default mode: product (product | test | debug)
pagerun.package = require('../package.json');
pagerun.version = pagerun.package.version;

var runConfigs ={};
var arrFilters = [];
var arrLogs = [];
var arrMessages = [];
var arrNpmPlugins = [];

// request map
var mapRequests = {};

// copy event function
pagerun.on = EventEmitterPrototype.on;
pagerun.emit = EventEmitterPrototype.emit;

// load plugin from core
var mapLoadedPlugins = {};
pagerun.loadPlugin = function(pluginName, bNpm){
    if(mapLoadedPlugins[pluginName] !== true){
        mapLoadedPlugins[pluginName] = true;
        var modulesRoot = pagerun.modulesRoot || path.resolve('node_modules');
        var plugin = bNpm ? require(path.resolve(modulesRoot, 'pagerun-'+pluginName)) : require('./plugins/'+pluginName);
        var pluginEnv = {};
        pluginEnv.config = function(defConfig){
            return pagerun.getConfig(pluginName, defConfig);
        };
        pluginEnv.log = function(type, message){
            return pagerun.log(pluginName, type, message);
        };
        pluginEnv.error = function(message){
            return pagerun.message(pluginName, 'error', message);
        };
        pluginEnv.warn = function(message){
            return pagerun.message(pluginName, 'warn', message);
        };
        pluginEnv.info = function(message){
            return pagerun.message(pluginName, 'info', message);
        };
        plugin.call(pluginEnv, pagerun);
        pagerun.log('pagerun', 'loadPlugin', pluginName + ' ('+(bNpm?'npm':'core')+')');
    }
}

// load plugin from npm
pagerun.loadNpmPlugin = function(pluginName){
    arrNpmPlugins.push(pluginName);
};

// set run config
pagerun.setConfig = function(configs){
    var newConfig;
    var oldConfig;
    for(var name in configs){
        oldConfig = runConfigs[name];
        newConfig = configs[name];
        if(typeof newConfig === 'object'){
            newConfig = extend(oldConfig?oldConfig:{}, newConfig);
        }
        runConfigs[name] = newConfig;
        
    }
};

// get filter config
pagerun.getConfig = function(name, defConfig){
    var config = runConfigs[name];
    if(typeof config === 'object'){
        config = extend(defConfig?defConfig:{}, config?config:{});
    }
    else if(config === undefined){
        config = defConfig?defConfig:'';
    }
    return config;
}

// add request map
pagerun.addRequestMap = function(path, data){
    mapRequests[path] = data;
}

// check url matched
pagerun.isMatchUrl = function(url, arrChecks){
    if(arrChecks !== undefined){
        for(var i=0,c=arrChecks.length;i<c;i++){
            if(isMatchUrl(url, arrChecks[i])){
                return true;
            }
        }
    }
    else{
        return true;
    }
    return false;
}

function isMatchUrl(url, check){
    var bMatch = false,
        regCheck = str2Reg(check);
    if(regCheck !== undefined){
        if(regCheck.test(url) === true){
            bMatch = true;
        }
    }
    else if(check.substr(0,1) === '!' && url === check.substr(1)){
        bMatch = true;
    }
    else if(url.indexOf(check) === 0){
        bMatch = true;
    }
    return bMatch;
}

function str2Reg(str){
    var match = str.match(/^\/(.+)\/([i])?$/);
    if(match !== null){
        var reg;
        try {
            reg = RegExp(match[1], match[2]);
        }
        catch(ex) {}
        if(reg !== undefined){
            return reg;
        }
    }
}

// save log
pagerun.log = function(module, type, message){
    message = message?message:'';
    var dateString = dateFormat('yyyy-MM-dd hh:mm:ss');
    arrLogs.push({
        module: module,
        type: type,
        message: message,
        time: new Date().getTime()
    });
    if(pagerun.mode !== 'product'){
        console.log('[' + dateString.green + ']: ',module,type,message);
    }
};

// save result
pagerun.message = function(module, type, message){
    arrMessages.push({
        type: type,
        module: module,
        message: message,
        time: new Date().getTime()
    });
}

// run
pagerun.run = function(done){

    // load core plugins
    pagerun.loadPlugin('pageproxy');
    pagerun.loadPlugin('hosts');
    pagerun.loadPlugin('webdriver');
    pagerun.loadPlugin('inject');
    pagerun.loadPlugin('bridge');

    // load npm plugins
    arrNpmPlugins.forEach(function(pluginName){
        pagerun.loadPlugin(pluginName, true);
    });

    var runState = false;
    pagerun.on('webdriverEnd', function(bSuccess){
        runState = bSuccess
    });
    pagerun.on('proxyStart', function(msg){
        var proxy = msg.proxy;
        proxy.addFilter(function(httpData, next, end){
                if(httpData.type === 'request' && httpData.hostname === 'pagerun'){
                    var responseData = mapRequests[httpData.hostname + httpData.path];
                    if(responseData !== undefined){
                        httpData.responseCode = responseData.responseCode;
                        httpData.responseHeaders = responseData.responseHeaders;
                        httpData.responseData = responseData.responseData;
                        return end();
                    }
                }
                next();
        });
    });
    pagerun.on('proxyEnd', function(){
        pagerun.log('pagerun','end');
        pagerun.emit('runEnd');
        done({
            success: runState,
            messages: arrMessages,
            logs: arrLogs
        });
    });

    pagerun.log('pagerun','start');
    pagerun.emit('runStart');

};

pagerun.localIp = utils.localIp();

module.exports = pagerun;