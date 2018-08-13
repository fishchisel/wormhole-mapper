'use strict';

var rep = require('local/repositories/scanned-system');
var errHandler = require('../error-handler');

var me = {};

/**
 * Clears Systems with no signatures, or are more than 7 days old and not pinned/starred
 */
me.clean = function () {
    var out = rep.initialize().then(function () {
        
        var old = rep.getSystemsArray().filter(me.isOldSystem);

        rep.supressChanged(true);
        old.forEach(function (x) {
            rep.deleteSystem(x)
        });
        rep.supressChanged(false);

        return old.length;
    });
    out.fail(errHandler);
    return out;
}
me.isOldSystem = function (sys) {
    if (sys.isPinned || sys.isStarred)
        return false;
    if (sys.getSignatures().length > 0)
        return false;

    var a = sys.lastPartialScan;

    var $7daysAgo = new Date().getTime() - 1000 * 60 * 60 * 24 * 7;
    if (a > $7daysAgo)
        return false;

    return true;
}



module.exports = me;