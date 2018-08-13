'use strict';

var scannedSystemRepository = require('local/repositories/scanned-system');
var wormholeRepository = require('local/repositories/wormhole');


var ScannedSystemDetails = function (sys) {
	this.data = sys;
	this.id = sys.id;
	this.name = sys.systemName;

	this.lastScannedPretty = sys.getLastScannedPretty();
	this.lastScannedFuzzy = sys.getLastScannedFuzzy();
	this.lastPartialScanPretty = sys.getLastPartialScanPretty();
	this.lastPartialScanFuzzy = sys.getLastPartialScanFuzzy();

	var homeSystem = siteConfig.homeSystem;
	this.distance = sys.getStaticJumpsToSystem(homeSystem);
	if (this.distance === null)
		this.distance = "\u221E";

	this.security = sys.getSecurityPretty();
	this.region = sys.regionName;
	this.numWormholes = sys.getWormholes().length;

	this.lastScanned = sys.lastScanned;
	this.lastPartial = sys.lastPartialScan;

};
ScannedSystemDetails.prototype.isRecent = function (mode) {
	var qr = mode == 'full' ? this.lastScanned : this.lastPartial;
	return qr + (60 * 60 * 1000 * 8) > new Date().getTime();
}
ScannedSystemDetails.prototype.isMedium = function (mode) {
	var qr = mode == 'full' ? this.lastScanned : this.lastPartial;
	return !this.isRecent(mode) && qr + (60 * 60 * 1000 * 24) > new Date().getTime();
}
ScannedSystemDetails.prototype.isOld = function (mode) {
	return !this.isRecent(mode) && !this.isMedium(mode);
}
ScannedSystemDetails.prototype.isSelected = function (other) {
	return other && this.id == other.id;
}

var sortingFunctions = {
	'pinned': function (a,b) {
	    if (a.data.isPinned && b.data.isPinned)
	        return sortingFunctions['lastScanned'](a, b);
	    return a.data.isPinned ? -1 : 1;
	},
	'starred': function (a, b) {
	    if (a.data.isStarred && b.data.isStarred || (!a.data.isStarred && !b.data.isStarred)) {
	        return sortingFunctions['pinned'](a, b);
	    }
		return a.data.isStarred ? -1 : 1;
	},
	'name': function (a, b) {
		return a.name < b.name ? -1 : 1;
	},
	'lastScanned': function (a, b) {
		var aScan = a.data.lastScanned;
		var bScan = b.data.lastScanned;
		if (aScan == bScan) return sortingFunctions['name'](a, b);
		return aScan < bScan ? -1 : 1;
	},
	'lastPartialScan': function (a,b) {
		var aScan = a.data.lastPartialScan;
		var bScan = b.data.lastPartialScan;
		if (aScan == bScan) return sortingFunctions['name'](a, b);
		return aScan < bScan ? -1 : 1;
	},
	'wormholes': function (a, b) {
		if (a.numWormholes == b.numWormholes) return 0;
		return a.numWormholes < b.numWormholes ? -1 : 1;
	},
	'distance': function (a, b) {
		var aJumps = isNumber(a.distance) ? a.distance : 1000;
		var bJumps = isNumber(b.distance) ? b.distance : 1000;
		if (aJumps == bJumps) return 0;
		return aJumps < bJumps ? -1 : 1;
	},
	'region': function (a, b) {
		if (a.region == b.region)
		    return sortingFunctions['lastScanned'](a, b);
		return a.region < b.region ? -1 : 1;
	}
}

var systemListController = function ($scope, $state, $timeout, $q) {

	var promises = $q.all(
		[scannedSystemRepository.initialize(),
			wormholeRepository.initialize()]);

	promises.then(displayScannedSystems);
	scannedSystemRepository.systemsChanged(displayScannedSystems);
	wormholeRepository.changed(displayScannedSystems);

	$scope.home = siteConfig.homeSystem.systemName;


	function displayScannedSystems() {
	    $scope.safeApply(function () {
	        var scannedSystems = scannedSystemRepository.getSystemsArray()
                .filter(function (sys) { return sys.isPinned || sys.isStarred; })
                .map(function (sys) {
                    return new ScannedSystemDetails(sys);
                }).sort(sortFunc);
	        $scope.scannedSystems = scannedSystems;
	    });
	};

	//-------------------------------------------------------------------------------------
	//Sorting
	var scanSortSelector = function (a, b) {
	    if ($scope.scanMode == "full")
	        return sortingFunctions['lastScanned'](a, b);
	    else
	        return sortingFunctions['lastPartialScan'](a, b);
	}
	var sortFunc = sortingFunctions['starred'];
	$scope.scanMode = "full";
            
	var distanceSortSelector = function (a, b) {
	    if ($scope.distanceMode == "distance")
	        return sortingFunctions['distance'](a, b);
	    else
	        return sortingFunctions['region'](a, b);
	}
	$scope.distanceMode = "distance";

	$scope.sort = function (type) {
	    var newFunc = sortingFunctions[type];
	    if (type == 'lastScan') {
	        newFunc = scanSortSelector;
	    }
	    else if (type == "distance") {
	        newFunc = distanceSortSelector;
	    }

	    if (newFunc === sortFunc) {
	        var oldFunc = sortFunc
	        sortFunc = function (a, b) { return oldFunc(a, b) * -1; };
	    }
	    else {
	        sortFunc = newFunc;
	    }
	    displayScannedSystems();
	}

	$scope.toggleScanMode = function () {
	    $scope.scanMode = $scope.scanMode == "full" ? "partial" : "full";
	    displayScannedSystems();
	}
	$scope.toggleDistanceMode = function () {
	    $scope.distanceMode = $scope.distanceMode == "distance" ? "region" : "distance";
	    displayScannedSystems();
	}

    //-------------------------------------------------------------------------------------
    // Moving to child state
	$scope.$watch('selectedSystem', function (value) {
	    if (value) {
	        $state.go('system-list.details', { systemName: value.systemName });
	    }
	    else {
	        $state.go('system-list');
	    }
	});

	$scope.clearSearch = function () {
	    $state.go('system-list');
	}

	$scope.go = function (scannedSystem) {
	    if ($scope.selectedSystem == scannedSystem)
	        $scope.setSelected(null);
	    else
	        $scope.setSelected(scannedSystem);
	}

	$scope.setSelected = function (system) {
	    if (system !== $scope.selectedSystem) {
	        $scope.selectedSystem = system;
	        $scope.searchQuery = system ? system.systemName : null;
	    }
	}

	//-------------------------------------------------------------------------------------
	$scope.$on('$destroy', function () {
	    scannedSystemRepository.systemsChangedRemoveHandler(displayScannedSystems);
	    wormholeRepository.changedRemoveHandler(displayScannedSystems);
	});
};


module.exports = systemListController;