'use strict';

var bridgeRepository = require('local/repositories/bridge');

var BridgeDetails = function (bridge) {
	this.bridge = bridge;

	this.homeSystem = bridge.getHomeSystem();
	this.name = bridge.name;
	this.bridgeRange = bridge.getBridgeRange() + " light years";
	this.bridgeType = bridge.getBridgeTypePretty();
	this.systemsInRange = bridge.getSystemsInRange().length;
};

var sortingFunctions = {
	'homeSystem': function (a, b) {
		if (a.homeSystem === b.homeSystem)
			return 0;

		return a.homeSystem.systemName < b.homeSystem.systemName ? -1 : 1;
	},
	'type': function (a, b) {
		if (a.bridgeType === b.bridgeType)
			return sortingFunctions['homeSystem'](a, b);
		return a.bridgeType < b.bridgeType ? -1 : 1;
	},
	'systemsInRange': function (a, b) {
		if (a.systemsInRange == b.systemsInRange)
			return 0;
		return a.systemsInRange < b.systemsInRange ? -1 : 1;
	}
}


module.exports = function ($scope, $state) {
	
	bridgeRepository.initialize().then(displayBridges);
	bridgeRepository.bridgesChanged(displayBridges);

	var sortFunc = sortingFunctions['homeSystem'];

	function displayBridges() {
	    $scope.safeApply(function () {
	        var bridges = bridgeRepository.getBridgesArray().map(function (item) {
	            return new BridgeDetails(item);
	        }).sort(sortFunc);
	        $scope.bridges = bridges;
	    });
	};

	$scope.edit = function (item) {
	    if ($scope.selected === item) {
	    	$scope.unselect();
	    }
	    else {
	    	$scope.selected = item;
	    	$state.go('bridge-list.edit', {bridge: item.bridge});
	    }
	}
	$scope.create = function () {
	    $scope.selected = undefined;
	    $state.go('bridge-list.edit', { bridgeDetails: null });
	}

	$scope.unselect = function () {
	    $scope.selected = undefined;
	    $state.go('bridge-list');
	}
	$scope.systemsInRange = function (bridgeDetails) {
	    $scope.selected = bridgeDetails;
	    $state.go('bridge-list.in-range', { bridge: bridgeDetails.bridge });
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
	    displayBridges();
	}

	$scope.$on('$destroy', function () {
	    bridgeRepository.bridgesChangedRemoveHandler(displayBridges);
	});
};
