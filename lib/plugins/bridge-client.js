(function(win, undefined){
    var pagerun = {};
    var arrTasks = []; // task list
    var arrMessages = []; // message list

    pagerun.isEnd = true; // pagerun end state

    var objEvents = {};
    pagerun.on = function(event, listener){
        var arrListeners = objEvents[event];
        if(arrListeners === undefined){
            arrListeners = objEvents[event] = [];
        }
        arrListeners.push(listener);
    };

    pagerun.emit = function(event){
        var arrListeners = objEvents[event];
        if(arrListeners !== undefined){
            var listener;
            for(var i=0,c=arrListeners.length;i<c;i++){
                listener = arrListeners[i];
                listener.apply(pagerun, arguments);
            }
        }
    }

    pagerun.newTask = function(taskName, taskFunc){
        pagerun.isEnd = false;
        var taskObj = {
            taskName: taskName,
            taskFunc: taskFunc,
            isEnd: false
        }
        arrTasks.push(taskObj);
        var taskEnv = {};
        taskEnv.error = function(message){
            pagerun.error(taskName, message);
        }
        taskEnv.warn = function(message){
            pagerun.warn(taskName, message);
        }
        taskEnv.info = function(message){
            pagerun.info(taskName, message);
        }
        taskEnv.end = function(){
            taskObj.isEnd = true;
            pagerun.emit('taskEnd', taskName);
        }
        taskFunc.call(taskEnv);
        pagerun.emit('newTask', taskName);
    }

    // save error
    pagerun.error = function(module, message){
        saveMessage('error', module, message);
    }

    // save warn
    pagerun.warn = function(module, message){
        saveMessage('warn', module, message);
    }

    // save info
    pagerun.info = function(module, message){
        saveMessage('info', module, message);
    }

    // save message
    function saveMessage(type, module, message){
        arrMessages.push({
            type: type,
            module: 'browser-' + module,
            message: message
        });
    };

    // get result
    pagerun.getResult = function(isToString){
        return isToString?JSON.stringify(arrMessages):arrMessages;
    };

    // check pagerun end
    pagerun.on('taskEnd', function(){
        var endState = true;
        var taskObj;
        for(var i=0,c=arrTasks.length;i<c;i++){
            taskObj = arrTasks[i];
            if(taskObj.isEnd === false){
                endState = false;
                break;
            }
        }
        if(endState === true){
            pagerun.isEnd = true;
            pagerun.emit('beforeEnd');
            pagerun.emit('end');
        }
    });

    win.pagerun = pagerun;
})(window);

(function(win){
    if(win.console === undefined){
        win.console = {};
    }
    console.log = function() {
        pagerun.info('console.log', Array.prototype.slice.call(arguments));
    };
    console.info = function() {
        pagerun.info('console.info', Array.prototype.slice.call(arguments));
    };
    console.debug = function() {
        pagerun.info('console.debug', Array.prototype.slice.call(arguments));
    };
    console.warn = function() {
        pagerun.warn('console.warn', Array.prototype.slice.call(arguments));
    };
    console.error = function() {
        pagerun.error('console.error', Array.prototype.slice.call(arguments));
    };

    win.alert = function(message) {
        pagerun.info('alert', message);
    };
    win.confirm = function(message) {
        pagerun.info('confirm', message);
    };
    win.prompt = function(message) {
        pagerun.info('prompt', message);
    };
})(window);

pagerun.newTask('defaultEnd', function(){
    var task = this;
    var win = window;
    var delay = $delayDefaultEnd;
    if(win.addEventListener){
        win.addEventListener("load", loadTriggered, false);
    }
    else{
        win.attachEvent("onload", loadTriggered);
    }
    function loadTriggered(){
        pagerun.emit('winload');
        if(delay > 0){
            setTimeout(function(){
                task.end();
            }, delay);
        }
        else{
            task.end();
        }
    }
});