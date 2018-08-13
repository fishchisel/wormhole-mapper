'use strict';

var me = function (error) {
    console.error(error);
    console.error(error.stack);
};

module.exports = me;