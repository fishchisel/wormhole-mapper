'use strict';

var dbLogin = require('../db-login');

var whLogger = require('./wormhole-logger');


var whRep = require('local/repositories/wormhole');

var me = {};

me.lastRun = 0;

me.start = function () {
    runWormholeLogger();
    whRep.changed(runWormholeLogger);
};

function runWormholeLogger() {

    dbLogin().then(function () {
        console.log("\nRunnning wormhole logger...");
        me.lastRun = Date.now();
        whLogger.checkAll().then(function (count) {
            console.log(count + " wormholes updated.");
        })
        .fail(function () {

        });
    });
}

module.exports = me;