'use strict';

var request = require('request'),
    q = require('q');

var appConfig = require('../config');

var URL = appConfig.itsmeUrl;

function auth(characterId) {
    var deferred = q.defer();

    var url = URL + characterId;

    request.get({
        url: url,
        timeout: 5000,        
    }, function (err, response, body) {
        try { body = JSON.parse(body) } catch (e) { }
        if (err || !body) {
            deferred.reject("Unknown error");
        }
        else if (!body.allowedAccess) {
            deferred.reject("Not allowed access");
        }
        else {
            deferred.resolve({
                id: Number(body.rootCharacterID),
                isAdmin: body.isAdmin
            });
        }
    });

    return deferred.promise;
}

module.exports = auth;