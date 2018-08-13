'use strict';

var app = require('angular').module('wormholeMapper');

app.factory('authorizationService',
			['$rootScope', '$state',
             require('./authorization-service')]);

