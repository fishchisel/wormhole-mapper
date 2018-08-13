'use strict';

var searchLogRep = require('local/repositories/route-log'),
    systemRep = require('local/repositories/system'),
    userRep = require('local/repositories/user');

var q = require('q'),
    moment = require('moment');

var Details = function (log) {
    this.data = log;

    this.startSystem = systemRep.getSystem(log.ssid);
    this.endSystem = systemRep.getSystem(log.esid);
    this.user = userRep.get(log.uid);
    this.time = log.time;
    this.id = "" + log.time + log.uid;
    //this.timeFuzzy = moment(log.time).fromNow();
    this.datePretty = moment(log.time).format("YYYY-MM-DD");
    this.timePretty = moment(log.time).format("HH:mm:ss");

    this.repeats = log.repeats;

    this.nullsec = this.startSystem.isNullsec() || this.endSystem.isNullsec();
    this.lowsec = this.startSystem.isLowsec() || this.endSystem.isLowsec();
    this.highsec = this.startSystem.isHighsec() || this.endSystem.isHighsec();
    this.wspace = this.startSystem.isWormholeSpace() || this.endSystem.isWormholeSpace();
}

module.exports = function ($scope, $state) {

    var def = q.all([searchLogRep.initialize(), systemRep.initialize(), userRep.initialize()]);
    def.then(display);
    searchLogRep.changed(display);

    var sortFunc = function (a, b) {
        return a.time < b.time ? 1 : -1;
    };

    function display() {
        $scope.safeApply(function () {
            var items = searchLogRep.getArray().reduce(function (prev, curr, indx) {
                var active = prev.length > 0 ? prev[prev.length - 1] : null;
                if (!active
                    || active.uid !== curr.uid
                    || active.ssid !== curr.ssid
                    || active.esid !== curr.esid) {
                    curr.repeats = 1;
                    prev.push(curr);
                }
                else {
                    active.repeats++;
                }
                return prev;                
            },[]).map(function (log) {
                return new Details(log);
            }).sort(sortFunc);

            $scope.items = items;
        });
    };

    $scope.$on('$destroy', function () {
        searchLogRep.changedRemoveHandler(display);
    });
};
