'use strict';

var sigCleaner = require('./signature-cleaner');
var wrmCleaner = require('./wormhole-cleaner');
var sysCleaner = require('./system-cleaner');
var wchCleaner = require('./wormhole-changelog-cleaner');
var wirCleaner = require('./wormhole-import-record-cleaner');
var slgCleaner = require('./searchlog-cleaner');
var lgnCleaner = require('./loginlog-cleaner');

var dbLogin = require('../db-login');

var me = {};
me.lastRun = 0;

var pulseTime = 1000 * 60 * 5;; // 5 minutes

me.start = function (delay) {
    if (delay)
        pulseTime = delay;



    clearOldData();
    setInterval(clearOldData, pulseTime);
};

function clearOldData() {

    dbLogin().then(function () {
        me.lastRun = Date.now();
        console.log("\nCleaning old data...");
        sigCleaner.clean().done(function (count) {
            console.log(count + " signatures deleted.");
        });
        sysCleaner.clean().done(function (count) {
            console.log(count + " systems deleted.");
        });
        wrmCleaner.clean().done(function (count) {
            console.log(count + " wormholes deleted.");
        });
        wchCleaner.clean().done(function (count) {
            console.log(count + " wormhole changelogs deleted.");
        });
        wirCleaner.clean().done(function (count) {
            console.log(count + " wormhole import records deleted.");
        });
        slgCleaner.clean().done(function (count) {
            console.log(count + " search logs deleted.");
        });
        lgnCleaner.clean().done(function (count) {
            console.log(count + " login logs deleted.");
        });

    })
    .catch(function (error) {
        console.error(error);
    });
}

me.run = clearOldData;

me.wrapped = function () {
    require('../init.js');
    me.run();
}

module.exports = me;