'use strict';

var rep = require('local/repositories/wormhole'),
    userService = require('../services/user-service.js');

var create = rep.create;
var update = rep.update;

rep.create = function (wh) {
    return set(wh, 'c').then(function (wh) {
        return create(wh);
    });
};
rep.update = function (wh) {
    return set(wh, 'u').then(function (wh) {
        return update(wh);
    });
};

function set(wh, type) {
    return userService.getCurrentUser().then(function (activeUser) {
        var id = activeUser ? activeUser.id : 0;
        var time = new Date().getTime();

        if (!wh.log) wh.log = {};

        wh.log[time] = { user: id, type: type }
        return wh;
    });
    
}