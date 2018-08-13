'use strict';

var bridgeRepository = require('local/repositories/bridge');

var me = {};

var store = require('store');

me.startSystemQuery = "";
me.endSystemQuery = "";

me.systemTypes = {
	'Highsec': 0,
	'Lowsec': 0,
	'Nullsec': 0,
	'Wormhole space': 0
};
me.transportMethods = {
	'Titans': true,      // this stops flickering on load
	'Black Ops': false,  //
	'Wormholes': true
};
me.minBridgeDistance = 3;
me.maxResults = 20;

me.setSystems = function (startSystem, endSystem) {
	me.startSystemQuery = startSystem.systemName;
	me.endSystemQuery = endSystem.systemName;
}

me.setParams = function (searchScope) {
    if (initializePromise && initializePromise.isFulfilled()) {
        me.systemTypes = searchScope.systemTypes;
        //me.transportMethods = searchScope.transportMethods;
        me.startSystemQuery = searchScope.startSystemQuery;
        me.endSystemQuery = searchScope.endSystemQuery;
        me.minBridgeDistance = searchScope.minBridgeDistance;
        me.maxResults = searchScope.maxResults;

        _setCache();
    }
};

me.getParamsToEditor = function (searchScope) {
	searchScope.systemTypes = me.systemTypes;
	searchScope.transportMethods = me.transportMethods;
	searchScope.startSystemQuery = me.startSystemQuery;
	searchScope.endSystemQuery = me.endSystemQuery;

	searchScope.minBridgeDistance = me.minBridgeDistance;
	searchScope.maxResults = me.maxResults;
}
me.getParamsForFinder = function () {
	var tIds, bIds;

	if (typeof (me.transportMethods['Titans']) !== 'object') {
		tIds = [];
	}
	else {
		tIds = Object.keys(me.transportMethods['Titans']).filter(function (t) {
			return me.transportMethods['Titans'][t].value;
		});
	}
	if (typeof (me.transportMethods['Black Ops']) !== 'object') {
		bIds = []
	}
	else {
		bIds = Object.keys(me.transportMethods['Black Ops']).filter(function (t) {
			return me.transportMethods['Black Ops'][t].value;
		});
	}

	return {
		hi: me.systemTypes['Highsec'],
		lo: me.systemTypes['Lowsec'],
		nl: me.systemTypes['Nullsec'],
		ws: me.systemTypes['Wormhole space'],
		br: tIds.concat(bIds),
		st: me.transportMethods['Stargates'],
		wh: me.transportMethods['Wormholes'],
		mbd: me.minBridgeDistance,
        mr: me.maxResults
	};
}

var initializePromise = false;

me.initialize = function () {
    if (!initializePromise) {
        initializePromise = bridgeRepository.initialize().then(function () {
            _getCache();
            _reloadBridges();
            bridgeRepository.bridgesChanged(_reloadBridges);
        });
    }

    return initializePromise;
}

function _reloadBridges() {
	var bridges = bridgeRepository.getBridges();
	var bridgesArray = bridgeRepository.getBridgesArray();

	var titans = me.transportMethods['Titans'];
	var blackops = me.transportMethods['Black Ops'];

	if (typeof (titans) !== 'object') titans = {};
	if (typeof (blackops) !== 'object') blackops = {};

	// insert new bridges into the relevant lists.
	bridgesArray.forEach(function (bridge) {
		if (bridge.bridgeType === 'titan') {
		    if (!titans[bridge.id])
		        titans[bridge.id] = { name: bridge.name, value: true }
		    else {
		        titans[bridge.id].name = bridge.name;
		    }
		}
		else if (bridge.bridgeType === 'blackops') {
		    if (!blackops[bridge.id]) {
		        blackops[bridge.id] = { name: bridge.name, value: false }
		    }
		    else {
		        blackops[bridge.id].name = bridge.name;
		    }
		}
	});

	// remove old bridges from the lists
	var func = function (id) { if (!bridges[id]) delete this[id]; };
	Object.keys(titans).forEach(func, titans);
	Object.keys(blackops).forEach(func, blackops);

	titans = Object.keys(titans).length === 0 ? false : titans;
	blackops = Object.keys(blackops).length === 0 ? false : blackops;

	me.transportMethods['Titans'] = titans;
	me.transportMethods['Black Ops'] = blackops;
}

var CACHE_VERSION = 1;
var KEY_NAME = 'route - search - params';
function _getCache() {
    var cachedParams = store.get(KEY_NAME);
    if (cachedParams && cachedParams.version === CACHE_VERSION) {
        if (cachedParams.transportMethods) me.transportMethods = cachedParams.transportMethods;
        if (cachedParams.systemTypes) me.systemTypes = cachedParams.systemTypes;
        if (cachedParams.minBridgeDistance) me.minBridgeDistance = cachedParams.minBridgeDistance;
        if (cachedParams.maxResults) me.maxResults = cachedParams.maxResults;
    }

}

function _setCache() {

    var output = {
        version: CACHE_VERSION,
        transportMethods: me.transportMethods,
        systemTypes: me.systemTypes,
        minBridgeDistance: me.minBridgeDistance,
        maxResults: me.maxResults
    }
    store.set(KEY_NAME, output);
}

module.exports = me;