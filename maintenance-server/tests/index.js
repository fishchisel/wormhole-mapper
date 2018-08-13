'use strict';

var repositories = require('local/repositories');
var config = require('../app/config.js');
repositories.setFirebaseUrl(config.firebaseUrl);
repositories.setStaticDataRoot("./app/");



require('./leaderboard-creator/wormhole-logger');