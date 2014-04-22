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
var arrResults = [];

// copy event function
pagerun.on = EventEmitterPrototype.on;
pagerun.emit = EventEmitterPrototype.emit;

// load plugin from core
pagerun.loadPlugin = function(pluginName, bNpm){
    var modulesRoot = path.resolve('node_modules');
    var plugin = bNpm ? require(path.resolve(modulesRoot, 'pagerun-'+pluginName)) : require('./plugins/'+pluginName);
    var pluginEnv = {};
    pluginEnv.config = function(defConfig){
        return pagerun.getConfig(pluginName, defConfig);
    };
    pluginEnv.log = function(type, message){
        return pagerun.log(pluginName, type, message);
    };
    pluginEnv.result = function(message){
        return pagerun.result(pluginName, message);
    };
    plugin.call(pluginEnv, pagerun);
}

// load plugin from npm
pagerun.loadNpmPlugin = function(pluginName){
    return pagerun.loadPlugin(pluginName, true)
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
pagerun.result = function(module, message){
    arrResults.push({
        module: module,
        message: message,
        time: new Date().getTime()
    });
}

// run
pagerun.run = function(done){
    var runState = false;
    pagerun.on('webdriverEnd', function(bSuccess){
        runState = bSuccess
    });
    pagerun.on('proxyEnd', function(){
        pagerun.log('pagerun','end');
        pagerun.emit('runEnd');
        done(runState, arrResults, arrLogs);
    });
    pagerun.log('pagerun','start');
    pagerun.emit('runStart');
};

pagerun.localIp = utils.localIp();
pagerun.loadPlugin('pageproxy');
pagerun.loadPlugin('hosts');
pagerun.loadPlugin('webdriver');
pagerun.loadPlugin('bridge');

module.exports = pagerun;