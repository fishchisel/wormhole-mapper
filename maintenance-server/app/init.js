
var repositories = require('local/repositories'),
    config = require('./config.js');


require('local');
repositories.setFirebaseUrl(config.firebaseUrl);