'use strict';

var rep = require('local/repositories/wormhole');
var errHandler = require('../error-handler');

var me = {};

/**
 * Clears wormholes that are expired.
 */
me.clean = function () {
    var out = rep.initialize().then(function () {
        var old = rep.getArray().filter(function (wh) {
            return wh.isExpired();
        });

        rep.supressChanged(true);
        old.forEach(function (x) { rep.delete(x) });
        rep.supressChanged(false);

        return old.length;
    });
    out.fail(errHandler);

    return out;
}



module.exports = me;