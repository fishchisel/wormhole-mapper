'use strict';

var dbLogin = require('../db-login.js');

var downloader = require('./downloader.js');
var inserter = require('./inserter.js');

var me = {};

me.lastRun = 0;
var pulseTime = 1000 * 60 * 5;; // 5 minutes

me.start = function (delay) {
    if (delay)
        pulseTime = delay;


    me.run();
    setInterval(me.run, pulseTime);
};


me.run = function() {
    return dbLogin().then(function () {
        console.log("Running Eve Scout import...");
        return downloader().then(function (res) {
            return inserter(res);
        }).then(function(num) {
            console.log("Imported " + num + " wormholes from eve scout.");
            me.lastRun = Date.now();
        }).fail(function (err) {
            console.log(err);
        });
    });
}

me.wrapped = function () {
    require('../init.js');
    me.run().then(function (num) {
        //console.log("Imported " + num + " wormholes from eve scout.");
    });
}

module.exports = me;