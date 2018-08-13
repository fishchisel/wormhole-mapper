'use strict';

var rep = require('local/repositories/route-log');
var errHandler = require('../error-handler');

var q = require('q');

var me = {};

/**
 * Clears wormholes that are expired.
 */
me.clean = function () {

    var out = rep.initialize().then(function () {

        var old = rep.getArray().filter(function (record) {
            return Number(record.time) < Date.now() - 1000 * 60 * 60 * 24 * 14;
        });

        rep.supressChanged(true);
        old.forEach(function (x) { rep.delete(x); });
        rep.supressChanged(false);

        return old.length;
    });
    out.fail(errHandler);
    return out;
}



module.exports = me;