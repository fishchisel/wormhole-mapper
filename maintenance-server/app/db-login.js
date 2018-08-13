'use strict';

var config = require('./config');

var login = require('local/server-login');

var id = "maintenance-server";
var secret = config.firebaseSecretKey;

module.exports = function () {
    return login(id, secret);
}