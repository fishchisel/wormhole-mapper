'use strict';

var whRep = require('local/repositories/wormhole'),
    wlRep = require('local/repositories/wormhole-changelog')
var errHandler = require('../error-handler');

var q = require('q');

var me = {};

/**
 * Clears wormholes that are expired.
 */
me.clean = function () {

    var out = q.all([whRep.initialize(), wlRep.initialize()]).then(function () {

        var old = wlRep.getArray().filter(function (ch) {
            return !whRep.get(ch.id);
        });

        wlRep.supressChanged(true);
        old.forEach(function (x) { wlRep.delete(x); });
        wlRep.supressChanged(false);

        return old.length;
    });
    out.fail(errHandler);
    return out;
}



module.exports = me;