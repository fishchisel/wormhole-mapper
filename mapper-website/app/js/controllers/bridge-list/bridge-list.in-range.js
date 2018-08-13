'use strict';

var q = require('q');

var bridgeRepository = require('local/repositories/bridge'),
    scannedSystemRepository = require('local/repositories/scanned-system');

module.exports = function ($scope, $stateParams) {

    var bridge = $stateParams.bridge;
    $scope.bridge = bridge;
    $scope.homeSystem = siteConfig.homeSystem;
    $scope.jumpsMode = 'bridge';

    q.all([bridgeRepository.initialize(), scannedSystemRepository.initialize()]).then(display);
    bridgeRepository.bridgesChanged(display);
    scannedSystemRepository.systemsChanged(display);

    function display() {
        $scope.safeApply(function () {
            var systems = bridge.getSystemsInRange().map(function (sys) {
                sys = scannedSystemRepository.getSystem(sys.id);
                
                var ret = {
                    data: sys,
                    jumpsHome: $scope.homeSystem.getStaticJumpsToSystem(sys),
                    jumpsBridge: bridge.getHomeSystem().getStaticJumpsToSystem(sys),
                    name: sys.systemName,
                    dist: sys.getDistanceFromSystem(bridge.getHomeSystem()).toFixed(2) + "ly",
                    isPinned: sys.isPinned
                }
                return ret;
            }).sort(function (a, b) {
                return a.dist < b.dist ? -1 : 1;
            });
            $scope.systems = systems;
        });
    }

    $scope.toggleJumpMode = function () {
        $scope.jumpsMode = $scope.jumpsMode === 'bridge' ? 'home' : 'bridge';
    }

    $scope.togglePinned = function (sys) {
        sys.isPinned = !sys.isPinned;
        scannedSystemRepository.updateSystem(sys);
    }

    $scope.close = function () {
    	$scope.$parent.unselect();
    }

    $scope.$on('$destroy', function () {
        bridgeRepository.bridgesChangedRemoveHandler(display);
        scannedSystemRepository.systemsChangedRemoveHandler(display);
    });
};
