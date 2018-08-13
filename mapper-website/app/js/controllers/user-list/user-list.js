'use strict';

var userRepository = require('local/repositories/user'),
    leaderboardRepository = require('local/repositories/leaderboard');

var q = require('q'),
    moment = require('moment');

var Details = function(user,leaderboardRec) {
    this.data = user;

    this.name = user.name;
    this.corporation = user.corporation;
    this.alliance = user.alliance ? user.alliance : '-';

    this.picUrl = user.getPortraitUrl(32);
    
    this.lastActivity = user.lastActivity;
    this.lastActivityPretty = user.getLastActivityPretty();
    this.lastActivityFuzzy = user.getLastActivityFuzzy();

    this.routesSearched = user.routesSearched;
    this.wormholesAdded = leaderboardRec.getTotal().wormholesAdded;

    //this.lastLogin = user.lastLogin;
    //this.lastLoginPretty = user.getLastLoginPretty();
    //this.lastLoginFuzzy = user.getLastLoginFuzzy();

    this.lastModified = leaderboardRec.lastModified;
    this.lastModifiedPretty = leaderboardRec.getLastModifiedPretty();
    this.lastModifiedFuzzy = leaderboardRec.getLastModifiedFuzzy();
}

var sortingFunctions = {
    name: function (a, b) {
        return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
    },
    corporation: function (a,b) {
        if (a.corporation == b.corporation) return sortingFunctions['name'];
        return a.corporation.toLowerCase() < b.corporation.toLowerCase() ? -1 : 1;
    },
    alliance: function (a,b) {
        if (a.alliance == b.alliance) return sortingFunctions['corporation'];
        return a.alliance.toLowerCase() < b.alliance.toLowerCase() ? -1 : 1;
    }
}
var getSortingFunction = function (paramName) {
    if (!sortingFunctions[paramName]) {
        sortingFunctions[paramName] = function (a, b) {
            if (a[paramName] === b[paramName]) return sortingFunctions.name(a, b);
            return a[paramName] < b[paramName] ? 1 : -1;
        }
    }
    return sortingFunctions[paramName];
}

module.exports = function ($scope, $state) {

    q.all([userRepository.initialize(), leaderboardRepository.initialize()])
        .then(display);

    userRepository.changed(display);
    leaderboardRepository.changed(display);

    var sortFunc = sortingFunctions['name'];

    function display() {
        $scope.safeApply(function () {
            var items = userRepository.getArray().map(function (user) {
                var leaderboard = leaderboardRepository.get(user.id);
                return new Details(user, leaderboard);
            }).sort(sortFunc);

            $scope.items = items;
        });
    };

    $scope.select = function (userDetails) {
        $state.go('user-details', { user: userDetails.name });
    };

    $scope.sort = function (type) {
        var newFunc = getSortingFunction(type);
        if (newFunc === sortFunc) {
            var oldFunc = sortFunc
            sortFunc = function (a, b) { return oldFunc(a, b) * -1; };
        }
        else {
            sortFunc = newFunc;
        }
        display();
    }

    $scope.$on('$destroy', function () {
        leaderboardRepository.changedRemoveHandler(display);
        userRepository.changedRemoveHandler(display);
    });
};
