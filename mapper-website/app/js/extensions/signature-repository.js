'use strict';

var rep = require('local/repositories/signature'),
    userService = require('../services/user-service.js');

var create = rep.createSignature;
var update = rep.updateSignature;

//rep.createSignature = function (s) {
//    return set(s, 'c').then(function (s) {
//        return create(s);
//    });
//};
//rep.updateSignature = function (s) {
//    return set(s, 'u').then(function (s) {
//        return update(s);
//    });
//};

//function set(s, type) {
//    return userService.getCurrentUser().then(function (activeUser) {
//        var id = activeUser ? activeUser.id : 0;
//        var time = new Date().getTime();

//        if (!s.log) s.log = {};

//        s.log[time] = { user: id, type: type }
//        return s;
//    });
//}