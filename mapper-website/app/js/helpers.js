'use strict';

// If the given item is present, removes it from the array.
Array.prototype.remove = function (item) {
    var index = this.indexOf(item);
    if (index !== -1)
        this.splice(index, 1);
}

// helper to detect when arrays of objects have changed.
// TODO this is too big and complicated to be an addon method
Array.prototype.detectChanges = function (oldArray, idField, modifiedField) {
    var newArray = this;

    idField = idField ? idField : 'id';
    modifiedField = modifiedField ? modifiedField : 'lastModified';

    // changes if length differs
    if (newArray.length !== oldArray.length)
        return true;

    for (var i = 0; i < newArray.length; i++) {
        var newArrayItem = newArray[i];

        // changes if item in oldarray isn't in new array
        var oldArrayItem = oldArray.find(function (itm) {
            return itm[idField] === newArrayItem[idField];;
        });
        if (!oldArrayItem)
            return true;

        // changes if the modifiedField has changed
        if (!oldArrayItem[modifiedField] || !newArrayItem[modifiedField]) {
            if (oldArrayItem[modifiedField] !== newArrayItem[modifiedField]) {
                return true;
            }
        }
        else if (oldArrayItem[modifiedField].getTime && newArrayItem[modifiedField].getTime) {
            if (oldArrayItem[modifiedField].getTime() !== newArrayItem[modifiedField].getTime())
                return true;
        }
        else {
            if (oldArrayItem[modifiedField] !== newArrayItem[modifiedField])
                return true;
        }
    }
    return false;
}

// String format. Usage: "Hello, {0}".format('World!');
if (!String.prototype.format) {
    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
              ? args[number]
              : match
            ;
        });
    };
}

global.isNumber = function(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

// intended to be called via browser console to assist in solving angular performance problems.
global.getWatchers = function(root) {
    root = angular.element(root || document.documentElement);
    var watcherCount = 0;
    function getElemWatchers(element) {
        var isolateWatchers = getWatchersFromScope(element.data().$isolateScope);
        var scopeWatchers = getWatchersFromScope(element.data().$scope);
        var watchers = scopeWatchers.concat(isolateWatchers);
        angular.forEach(element.children(), function (childElement) {
            watchers = watchers.concat(getElemWatchers(angular.element(childElement)));
        });
        return watchers;
    }
    function getWatchersFromScope(scope) {
        if (scope) {
            return scope.$$watchers || [];
        } else {
            return [];
        }
    }
    return getElemWatchers(root);
}
global.countWatchers = function() {
    return getWatchers().length;
}