'use strict';

var wormholeRepository = require('local/repositories/wormhole');

var Wormhole = require('local/repositories/wormhole/wormhole.js');

var ctrl = function ($scope, $stateParams) {
    if ($stateParams.wormhole) {
        console.log($stateParams);
        $scope.wormhole = $stateParams.wormhole.clone();
        $scope.isExisting = true;
    }
    else {
        $scope.wormhole = new Wormhole();
    }

    $scope.$watchGroup(['wormhole.startSystemId', 'wormhole.endSystemId'], function () {
        $scope.$parent.setTransientDuplicate($scope.wormhole);
    });

    // search functions
    $scope.canSave = function () {
        var hasIds = $scope.wormhole.startSystemId && $scope.wormhole.endSystemId;
        var safeNote = !$scope.wormhole.noteIsTooLong();
        return hasIds && safeNote;
    };

    // actions
    $scope.save = function () {
        if ($scope.wormhole.id) {
            wormholeRepository.update($scope.wormhole);
        }
        else {
            wormholeRepository.create($scope.wormhole);
        }
        $scope.close();
    };
    $scope.delete = function () {
        wormholeRepository.delete($scope.wormhole);
        $scope.close();
    }
    $scope.close = function () {
        $scope.$parent.unselect();
    }
};

module.exports = ctrl;