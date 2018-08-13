'use strict';

var bridgeRepository = require('local/repositories/bridge'),
    Bridge = require('local/repositories/bridge/bridge.js');


module.exports = function ($scope, $stateParams) {

    if ($stateParams.bridge) {
    	$scope.bridge = $stateParams.bridge.clone();
    	$scope.isExisting = true;
    }
    else {
    	$scope.bridge = new Bridge();
    }

    $scope.$watchGroup(['bridge.homeSystemId', 'bridge.bridgeType'], function () {

    	var type = $scope.bridge.bridgeType;
    	type = type ? type : "bridge";

    	var sys = $scope.bridge.getHomeSystem();

    	sys = sys ? sys.systemName : "new";
    	sys = $scope.homeSystem ? $scope.homeSystem.systemName : sys

    	if (!$scope.isExisting) {
    	    $scope.bridge.name = "The " + sys + " " + type;
    	}
    });

    $scope.bridgeTypes = Bridge.possibleBridgeTypes;

    $scope.canSave = function () {
    	return $scope.bridge.homeSystemId && $scope.bridge.bridgeType;
    };

    //actions
    $scope.save = function () {
    	if ($scope.bridge.id)
    		bridgeRepository.updateBridge($scope.bridge);
    	else
    		bridgeRepository.createBridge($scope.bridge);
    	$scope.close();
    };
    $scope.delete = function () {
    	bridgeRepository.deleteBridge($scope.bridge);
    	$scope.close();
    }
    $scope.close = function () {
    	$scope.$parent.unselect();
    }
    
    function create(bridge) {
    	bridgeRepository.createBridge(bridge);
    	$scope.close();
    }
    function update(bridge) {
    	bridgeRepository.updateBridge(bridge);
    	$scope.close();
    }

};