'use strict';

var bridgeRepository = require('local/repositories/bridge');
var wormholeRepository = require('local/repositories/wormhole');

var pathfinder = require('local/pathfinder');

var WormholeDetails = require('../wormhole-list/wormhole-details.js');


var SHIP_CLASSES = require('../../models/ship-classes');

module.exports = function ($scope, $state, $stateParams, $timeout) {
    var prms = $stateParams

    // redirect if bad data
    if (!prms.start || !prms.end) {
        $state.go('route-finder');
        return;
    }

    // setup scope functions
    $scope.toggleExpandPartition = function(partition) {
        partition.expanded = !partition.expanded;
    }
    $scope.recalculatePaths = calculatePaths;

    $scope.shipClass = SHIP_CLASSES['cruiser'];

    $scope.showTimeToExpire = false;
    $scope.toggleShowTimeToExpire = function () {
        $scope.showTimeToExpire = !$scope.showTimeToExpire;
    }
    $scope.getPathTimeTooltip = function (path) {
        if (!path.hasWormholes) return null;
        if ($scope.showTimeToExpire) return path.getAgeFuzzy();
        return path.getDateExpiresFuzzy();
    }

    calculatePaths();

    wormholeRepository.changed(linksChanged);
    bridgeRepository.bridgesChanged(linksChanged);

    // some private functions
    function linksChanged() {
        $scope.linksChanged = true;
    }

    function calculatePaths() {
        $scope.linksChanged = false;
        $scope.isFindingPaths = true;
        
        var bridges = prms.br.map(function (brId) {
            return bridgeRepository.getBridge(brId);
        });
        var wormholes = prms.wh ? wormholeRepository.getArray() : [];

        console.log(prms);

        var args = {
            startSys: prms.start,
            endSys: prms.end,
            wormholes: wormholes,
            bridges: bridges,
            highsec: prms.hi,
            lowsec: prms.lo,
            nullsec: prms.nl,
            wspace: prms.ws,
            maxPaths: prms.mr,
            minBridgeDistance: prms.mbd,

        }

        pathfinder.findPaths(args).done(function (results) {
            results.forEach(function (x) { attachWormholeDetails(x) });

            $scope.safeApply(function () {
                $scope.foundPaths = results;
                $scope.isFindingPaths = false;
                $scope.hasFoundPaths = $scope.foundPaths.length > 0;
            });
        });

        //$timeout(function () {

        //    var bridges = prms.br.map(function (brId) {
        //        return bridgeRepository.getBridge(brId);
        //    });

        //    $scope.foundPaths = pathfinderCacheService.findPaths({
        //        startSys: prms.start,
        //        endSys: prms.end,
        //        wormholes: wormholeRepository.getArray(),
        //        bridges: bridges,
        //        excludeHighsec: !prms.hi,
        //        excludeLowsec: !prms.lo,
        //        excludeNullsec: !prms.nl,
        //        excludeWspace: !prms.ws,
        //        noWormholes: !prms.wh,
        //        noGates: !prms.st,
        //        //oneBridgeOnly: true
        //    });
        //    $scope.foundPaths.forEach(function (x) {
        //        attachWormholeDetails(x);
        //    })

        //    $scope.isFindingPaths = false;
        //    $scope.hasFoundPaths = $scope.foundPaths.length > 0;

        //});
    }

    // bit of a hack, waiting for refactoring of the route details object.
    function attachWormholeDetails(foundPath) {

        foundPath.routePartition.forEach(function (itm) {
            if (itm.type !== "wormhole") return;

            itm.wormholeDetails = itm.wormholes.map(function (x) { return new WormholeDetails(x); });

            var near = itm.startSystem;
            itm.wormholeDetails.forEach(function (x) {
                x.nearSystem = near;

                if (x.startSystem === near) {
                    x.farSystem = x.endSystem;
                    var sig = x.wormhole.getStartSignature();
                }
                else {
                    x.farSystem = x.startSystem;
                    var sig = x.wormhole.getEndSignature();
                }
                x.wormholeId = sig ? sig.id : "-";
                near = x.farSystem;
            });
        });
    }

    // remove handler when we are destroyed
    $scope.$on('$destroy', function () {
        wormholeRepository.changedRemoveHandler(linksChanged);
        bridgeRepository.bridgesChangedRemoveHandler(linksChanged);
    });
}