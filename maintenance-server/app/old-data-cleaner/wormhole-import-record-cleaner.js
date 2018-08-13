'use strict';

var imRep = require('local/repositories/wormhole-import-record');
var errHandler = require('../error-handler');

var q = require('q');

var me = {};

/**
 * Clears wormholes that are expired.
 */
me.clean = function () {

    var out = imRep.initialize().then(function () {

        var old = imRep.getArray().filter(function (record) {
            return record.lastModified < Date.now() - 1000 * 60 * 60 * 24 * 2;
        });

        imRep.supressChanged(true);
        old.forEach(function (x) { imRep.delete(x); });
        imRep.supressChanged(false);

        return old.length;
    });
    out.fail(errHandler);
    return out;
}



module.exports = me;