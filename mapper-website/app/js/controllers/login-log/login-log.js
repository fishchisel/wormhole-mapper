'use strict';

var loginRep = require('local/repositories/login-log');

var q = require('q'),
    moment = require('moment');

var Details = function (log) {
    this.data = log;
    this.id = log.id;

    this.charName = log.charName;
    this.initCharName = log.initCharName;

    this.time = Number(log.id);
    this.datePretty = moment(this.time).format("YYYY-MM-DD");
    this.timePretty = moment(this.time).format("HH:mm:ss");
}

module.exports = function ($scope, $state) {

    var def = q.all([loginRep.initialize()]);
    def.then(display);
    loginRep.changed(display);

    var sortFunc = function (a, b) {
        return a.time < b.time ? 1 : -1;
    };

    function display() {
        $scope.safeApply(function () {
            var items = loginRep.getArray().map(function (log) {
                return new Details(log);
            }).sort(sortFunc);

            $scope.items = items;
        });
    };

    $scope.$on('$destroy', function () {
        loginRep.changedRemoveHandler(display);
    });
};
