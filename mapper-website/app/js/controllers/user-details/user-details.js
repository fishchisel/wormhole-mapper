'use strict';

var userRepository = require('local/repositories/user'),
    leaderboardRepository = require('local/repositories/leaderboard');

var slRep = require('local/repositories/route-log');

var q = require('q'),
    moment = require('moment');

var Details = function (user, leaderboardRec) {
    this.data = user;
    this.id = user.id;

    this.name = user.name;
    this.corporation = user.corporation;
    this.alliance = user.alliance ? user.alliance : '-';

    this.picUrl = user.getPortraitUrl(64);

    var totals = leaderboardRec.getTotal();
    this.totals = totals;

    this.wa = totals.wormholedAdded;
    this.wpc = totals.wormholesPartCompleted;
    this.fwpc = totals.foreignWormholesPartCompleted;
    this.wc = totals.wormholesCompleted;
    this.fwc = totals.foreignWormholesCompleted;

    this.sps = totals.systemsPartScanned;
    this.ss = totals.systemsFullScanned;
    this.l = totals.likes;
}

var DayDetails = function (segment) {

    this.datePretty = segment.getPeriodStartPretty();

    this.totals = segment;

    this.wa = segment.wormholesAdded;
    this.wpc = segment.wormholesPartCompleted + segment.foreignWormholesPartCompleted;
    this.wc = segment.wormholesCompleted + segment.foreignWormholesCompleted;

    this.sps = segment.systemsPartScanned;
    this.ss = segment.systemsFullScanned;
    this.l = segment.likes;

}

module.exports = function ($scope, $state, $stateParams) {
    
    var username = $stateParams.user;

    q.all([userRepository.initialize(), leaderboardRepository.initialize()])
        .then(display)
        .then(adminInfo);

    userRepository.changed(display);
    leaderboardRepository.changed(display);

    function display() {
        $scope.safeApply(function () {

            var user = userRepository.getByName(username);
            if (!user) {
                $state.go('users');
                return;
            }
            
            var leaderboard = leaderboardRepository.get(user.id);
            var dtls = new Details(user, leaderboard);
            
            var dayDtls = leaderboard.getDays(10).map(function (x) {
                return new DayDetails(x);
            });

            $scope.usrDtls = dtls;
            $scope.days = dayDtls;
        });
    };

    function adminInfo() {
        if ($scope.userRoles.admin) {
            slRep.initialize().then(function () {
                $scope.safeApply(function () {
                    var uid = userRepository.getByName(username).id;

                    var times = slRep.getArray().filter(function (x) {
                        return x.uid === uid;
                    }).map(function (x) { return x.time });
                    if (times.length) {
                        var latest = Math.max.apply(null, times);
                        if (latest) {
                            $scope.latest = moment(latest).format("llll");
                        }
                    }
                });
            });


        }

    };

    $scope.$on('$destroy', function () {
        leaderboardRepository.changedRemoveHandler(display);
        userRepository.changedRemoveHandler(display);
    });
};
