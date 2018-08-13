'use strict';

var userRepository = require('local/repositories/user'),
    leaderboardRepository = require('local/repositories/leaderboard');

var q = require('q'),
    moment = require('moment');

module.exports = function ($scope, $state) {
    q.all([userRepository.initialize(), leaderboardRepository.initialize()])
        .then(display);

    userRepository.changed(display);
    leaderboardRepository.changed(display);

    function display() {
        $scope.safeApply(function () {
            var users = userRepository.getArray().map(function (user) {
                var leaderboard = leaderboardRepository.get(user.id);                             

                return {usr:user, ldr: leaderboard};
            });

            createData(users);
        });
    };

    function createData(users) {
        $scope.hasLoadedLeaderboard = true;

        var now = Date.now();
        var yesterday = now - 1000 * 60 * 60 * 24;

        //wormholes added today

        var allUsers = users.map(function (x) {
            return { usr: x.usr, data: x.ldr.getTotal() }
        });

        var todayUsers = users.map(function (x) {
            return { usr: x.usr, data: x.ldr.getDayForTime(now) };
        }).filter(function (x) { return x.data; });

        var yesterdayUsers = users.map(function (x) {
            return { usr: x.usr, data: x.ldr.getDayForTime(yesterday) };
        }).filter(function (x) { return x.data; });

        var last10daysUsers = users.map(function (x) {
            return { usr: x.usr, data: x.ldr.getDaysTotal(10) };
        }).filter(function (x) { return x.data; });

        $scope.whAdded = {
            today: makeEntry(todayUsers, 'wormholesAdded'),
            yesterday: makeEntry(yesterdayUsers, 'wormholesAdded'),
            last10: makeEntry(last10daysUsers, 'wormholesAdded'),
            allTime: makeEntry(allUsers, 'wormholesAdded')
        }

        $scope.whComplete = {
            today: makeEntry(todayUsers, 'totalWormholesCompleted'),
            yesterday: makeEntry(yesterdayUsers, 'totalWormholesCompleted'),
            last10: makeEntry(last10daysUsers, 'totalWormholesCompleted'),
            allTime: makeEntry(allUsers, 'totalWormholesCompleted')
        }
    }

    function combine (prop1, prop2, propcomb) {
        return function (x) { x[propcomb] = x[prop1] + x[prop2]; }
    }

    function makeEntry(users, prop) {
        return users.map(function (x) {
            return {
                user: x.usr,
                score: x.data[prop]
            }
        }).filter(function (x) {
            return x.score > 0;
        });
    }

    $scope.$on('$destroy', function () {
        leaderboardRepository.changedRemoveHandler(display);
        userRepository.changedRemoveHandler(display);
    });
};
