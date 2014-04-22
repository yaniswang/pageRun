(function(win){
    var pagerun = {};
    var arrBeforeEnd = [];
    var arrAfterEnd = [];
    var arrResults = [];
    var bEnd = false;
    var waitCount = 0;
    var endCount = 0;

    // save result
    pagerun.result = function(type, content){
        if(bEnd === false){
            arrResults.push({
                url: location.href,
                type: type,
                content: content
            });
        }
    };
    // get result
    pagerun.getResult = function(toString){
        return toString?JSON.stringify(arrResults):arrResults;
    };
    // add task wait
    pagerun.waitMe = function(){
        waitCount ++;
    };
    //callback when before end
    pagerun.beforeEnd = function(callback){
        if(bEnd === true){
            callback();
        }
        else{
            arrBeforeEnd.push(callback);
        }
    };
    // callback when after end
    pagerun.afterEnd = function(callback){
        if(bEnd === true){
            callback();
        }
        else{
            arrAfterEnd.push(callback);
        }
    };
    // check end when webdriver end
    pagerun.checkEnd = function(callback){
        if(waitCount === 0){
            callback();
        }
        else{
            pagerun.afterEnd(callback);
        }
    };
    // end task
    pagerun.end = function(){
        endCount ++;
        if(endCount >= waitCount){
            for (var i = 0, c = arrBeforeEnd.length; i < c; i++) {
                arrBeforeEnd[i]();
            }
            bEnd = true;
            for (var i = 0, c = arrAfterEnd.length; i < c; i++) {
                arrAfterEnd[i]();
            }
        }
    };
    win.pagerun = pagerun;
})(window);
(function(win){
    if(win.console === undefined){
        win.console = {};
    }
    console.log = function() {
        pagerun.result('console.log', Array.prototype.slice.call(arguments));
    };
    console.info = function() {
        pagerun.result('console.info', Array.prototype.slice.call(arguments));
    };
    console.debug = function() {
        pagerun.result('console.debug', Array.prototype.slice.call(arguments));
    };
    console.warn = function() {
        pagerun.result('console.warn', Array.prototype.slice.call(arguments));
    };
    console.error = function() {
        pagerun.result('console.error', Array.prototype.slice.call(arguments));
    };

    win.alert = function(message) {
        pagerun.result('alert', message);
    };
    win.confirm = function(message) {
        pagerun.result('confirm', message);
    };
    win.prompt = function(message) {
        pagerun.result('prompt', message);
    };
})(window);