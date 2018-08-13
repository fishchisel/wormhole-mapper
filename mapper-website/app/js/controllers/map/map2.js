var sysRep = require('local/repositories/system'),
    scannedSysRep = require('local/repositories/scanned-system'),
    wrmRep = require('local/repositories/wormhole'),
    pathfinder = require('local/pathfinder');

var q = require('q');

var VivaGraphService = require('../../services/viva-graph-service');

module.exports = function ($scope, $state) {

    var vivaGraph = {};

    $scope.setBodyClass('hide-background-image');

    q.all([
        sysRep.initialize(),
        wrmRep.initialize(),
        scannedSysRep.initialize(),
    ]).done(function () {

        var targetElement = document.getElementById('map-container');
        vivaGraph = VivaGraphService(targetElement);
        vivaGraph.run();
        vivaGraph.toggleAutoLayout();


        $scope.safeApply(function () {
            $scope.hasInitialized = true;
        });
    });

    $scope.autoLayoutRunning = true;
    $scope.toggleAutolayout = function () {
        vivaGraph.toggleAutoLayout();
        $scope.autoLayoutRunning = ! $scope.autoLayoutRunning;
    }

    $scope.savePositions = function () {
        vivaGraph.savePositions();
    }
    $scope.loadPositions = function () {
        vivaGraph.loadPositions();

    }
    $scope.resetPositions = function () {
        vivaGraph.resetPositions();

    }

    $scope.hasWormholes = false;
    $scope.toggleWormholes = function () {
        if ($scope.hasWormholes) {
            vivaGraph.removeWormholes();
        }
        else {
            var wormholes = wrmRep.getArray();
            vivaGraph.addWormholes(wormholes);
        }
        $scope.hasWormholes = !$scope.hasWormholes;
    }

    $scope.$on('$destroy', function () {
        $scope.setBodyClass(null);
    });
};