'use strict';

var moment = require('moment');

var config = require('./config.js'),
    cleaner = require('./old-data-cleaner'),
    ldrLogger = require('./leaderboard-recorder'),
    esImport = require('./eve-scout-import');


require('./init.js');

// start maintenance code
cleaner.start();
ldrLogger.start();
esImport.start();


// echo back that we are alive and stuff
var server = require('express')();
var port = process.env.PORT || 1337;

server.get('/', function (req, res) {
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Origin', '*');
    
    res.writeHead(200, { 'Content-Type': 'application/json' });

    var output = JSON.stringify({
        target: config.firebaseUrl,
        lastMaintenanceRun: cleaner.lastRun,
        lastMaintenanceRunFuzzy: moment(cleaner.lastRun).fromNow(),
        lastLeaderboardUpdate: ldrLogger.lastRun,
        lastLeaderboardUpdateFuzzy: moment(ldrLogger.lastRun).fromNow()
    }, null, "  ");
    res.end(output);
});

server.listen(port, function () {
    console.log("Maintenance server running on port " + port);
})