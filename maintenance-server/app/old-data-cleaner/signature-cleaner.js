'use strict';

var rep = require('local/repositories/signature');
var errHandler = require('../error-handler');

var me = {};

/**
 * Clears signatures more than 7 days old
 */
me.clean = function () {
    var out = rep.initialize().then(function () {

        var old = rep.getSignaturesArray().filter(me.isOldSignature);

        rep.supressChanged(true);
        old.forEach(function (x) { rep.deleteSignature(x) });
        rep.supressChanged(false);

        return old.length;
    });
    out.fail(errHandler);

    return out;
}
me.isOldSignature = function (sys) {    
    var a = sys.lastScanned;

    var $7daysAgo = new Date().getTime() - 1000 * 60 * 60 * 24 * 7;
    if (a > $7daysAgo)
        return false;

    return true;
}



module.exports = me;