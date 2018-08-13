'use strict';

var moment = require('moment'),
    bodyParser = require('body-parser');

var repositories = require('local/repositories'),
    config = require('./config.js'),
    authorize = require('./authorize.js'),
    dbLogin = require('local/server-login');

// Setup
require('local');
repositories.setFirebaseUrl(config.firebaseUrl);

// echo back that we are alive and stuff
var server = require('express')();
var port = process.env.PORT || 1337;

// NOTE: ENSURE YOU'RE USING THE CORRECT HEADERS WITH FIDDLER
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

server.get('/', function (req, res) {
    res.send("Login Server is running.");
});

server.post('/login', function (req, res) {
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Origin', '*');

    var authCode = req.body.authCode;

    if (!authCode) {
        sendError(res, "Bad Request. authCode parameter is required.");
        return;
    }

    dbLogin("login-server", config.firebaseSecretKey).then(function () {
        authorize(authCode)
            .then(function (x) {
                res.json(x);
                res.end();
            })
            .fail(function (msg) {
                sendError(res, msg);
            });
    });
});

server.listen(port, function () {
    console.log("Login server running on port " + port);
})

function sendError(res, msg) {
    msg = String(msg);
    res.status(400).send(msg);
    res.end();
}