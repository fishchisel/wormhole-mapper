'use strict';

var logRep = require('local/repositories/wormhole-changelog'),
    leaderboardRep = require('local/repositories/leaderboard'),
    whRep = require('local/repositories/wormhole');

var errHandler = require('../error-handler');

var req

var q = require('q');

var me = {};

me.checkAll = function () {
    var out = whRep.initialize().then(function () {
        var wormholes = whRep.getArray();
        var proms = [];

        wormholes.forEach(function (wormhole) {
            proms.push(me.checkWormhole(wormhole));
        });

        return q.all(proms);
    }).then(function (results) {
        var numUpdated = results.reduce(function (prev, curr) {
            return prev + curr;
        }, 0);
        return numUpdated;
    });
    out.fail(errHandler);
    return out;
};

me.checkWormhole = function (wormhole) {

    var a = q.all([leaderboardRep.initialize(), logRep.initialize()]).then(function () {
        if (!hasNewState(wormhole))
            return false;

        var oldSate = getOldState(wormhole);
        var newState = getState(wormhole);
        var userId = wormhole.getLastEditorId();
        var creatorId = wormhole.getCreatorId();

        if (!userId)
            return false;

        var statsDelta = getNewStats(oldSate, newState, creatorId, userId);

        var leaderboardRecord = leaderboardRep.get(userId);

        leaderboardRecord.addStats(new Date().getTime(), statsDelta);

        logRep.set(wormhole.id, newState);
        leaderboardRep.update(leaderboardRecord);

        return true;
    })

    a.fail(errHandler);


    return a;
}

var getOldState = function(wormhole) {
    var id = wormhole.id;
    var log = logRep.get(id);

    if (!log) return null;        
    return log.state;
}

var hasNewState = function (wormhole) {
        
    var oldState = getOldState(wormhole);
    var newState = getState(wormhole);
        
    if (oldState !== newState)
        return true;
}

var getState = function (wormhole) {
    if (!wormhole.wormholeClassName)
        return "uncomplete";

    var stt = wormhole.getStartSignature();
    var end = wormhole.getEndSignature();

    if (stt && end) return "complete";
    if (stt || end) return "partial";
    return "uncomplete";
}

var getNewStats = function (oldState, newState, creatorId, changerId) {

    var out = {
        wormholesAdded: oldState ? 0 : 1
    };
    if (isGreaterState("uncomplete", newState) && !isGreaterState("uncomplete", oldState)) {
        if (creatorId == changerId)
            out.wormholesPartCompleted = 1;
        else
            out.foreignWormholesPartCompleted = 1;
    }
    if (isGreaterState("partial", newState) && !isGreaterState("partial", oldState)) {
        if (creatorId == changerId)
            out.wormholesCompleted = 1;
        else
            out.foreignWormholesCompleted = 1;
    }

    return out;
}

var isGreaterState = function(testState,state) {
    if (!state) state = "uncomplete";

    var states = [
        "uncomplete",
        "partial",
        "complete"
    ];

    var a = states.indexOf(testState);
    var b = states.indexOf(state);
    
    return a < b;
}




module.exports = me;