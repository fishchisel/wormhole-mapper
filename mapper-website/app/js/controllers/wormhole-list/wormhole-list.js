'use strict';

var WormholeDetails = require('./wormhole-details');
var wormholeRepository = require('local/repositories/wormhole');

var sortingFunctions = {
    'near': function (a, b) {
        if (a.nearSystem === b.nearSystem && a.farSystem == b.farSystem)
            return 0;
        if (a.nearSystem === b.nearSystem)
            return sortingFunctions['far'](a, b);
        return a.nearSystem.systemName < b.nearSystem.systemName ? -1 : 1;
    },
    'far': function (a, b) {
        if (a.farSystem === b.farSystem)
            return sortingFunctions['near'](a, b);
        return a.farSystem.systemName < b.farSystem.systemName ? -1 : 1;
    },
    'class': function (a, b) {
        if (a.class == b.class)
            return 0;
        return a.class < b.class ? -1 : 1;
    },
    'timeFound': function (a, b) {
        var aTime = a.wormhole.getDateFound();
        var bTime = b.wormhole.getDateFound();
        return aTime < bTime ? 1 : -1;
    },
    'timeExpires': function (a, b) {
        var aTime = a.wormhole.getDateExpires();
        var bTime = b.wormhole.getDateExpires();
        return aTime < bTime ? -1 : 1;
    },
    'jumps': function (a, b) {
        var aJumps = isNumber(a.staticJumps) ? a.staticJumps : 1000;
        var bJumps = isNumber(b.staticJumps) ? b.staticJumps : 1000;

        if (aJumps === bJumps)
            return sortingFunctions['near'](a, b);
        return aJumps < bJumps ? -1 : 1;
    },
    'distance': function (a, b) {
        var aJumps = isNumber(a.distanceFromHome) ? a.distanceFromHome : 1000;
        var bJumps = isNumber(b.distanceFromHome) ? b.distanceFromHome : 1000;

        if (aJumps === bJumps)
            return sortingFunctions['near'](a, b);
        return aJumps < bJumps ? -1 : 1;
    }
}

var ctrl = function ($scope, $state, $timeout) {
    $scope.home = siteConfig.homeSystem;

    var sortFunc = sortingFunctions['timeFound'];

    wormholeRepository.initialize().then(displayWormholes);
    wormholeRepository.changed(displayWormholes);
    function displayWormholes() {
        $timeout(function () {
            var wormholes = wormholeRepository.getArray().map(function (item) {
                return new WormholeDetails(item);
            }).sort(sortFunc);
            $scope.wormholes = wormholes;
        });
    };

    $scope.edit = function (item) {
        if ($scope.selected === item) {
            $scope.unselect();
        }
        else {
            $scope.selected = item;
            $state.go('wormhole-list.edit', { wormhole: item.wormhole });
        }
    }
    $scope.create = function () {
        $scope.selected = undefined;
        $state.go('wormhole-list.edit');
    }

    $scope.unselect = function () {
        $scope.selected = undefined;
        $scope.setTransientDuplicate(null);
        $state.go('wormhole-list');
    }

    $scope.setTransientDuplicate = function (wormhole) {
        $scope.wormholes.forEach(function (wh) {
            if (!wormhole || wormhole.id === wh.wormhole.id)
                wh.isTransientDuplicate = false;
            else
                wh.isTransientDuplicate = wh.wormhole.isDuplicate(wormhole);
        });
    }

    $scope.sort = function (type) {
        var newFunc = sortingFunctions[type];
        if (newFunc === sortFunc) {
            var oldFunc = sortFunc
            sortFunc = function (a, b) { return oldFunc(a, b) * -1; };
        }
        else {
            sortFunc = newFunc;
        }
        displayWormholes();
    }

    $scope.$on('$destroy', function () {
        wormholeRepository.changedRemoveHandler(displayWormholes);
    });
};


module.exports = ctrl;