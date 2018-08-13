'use strict';

var request = require('request'),
    q = require('q');

var appConfig = require('../config');

var config = {
    basicAuthHeader: 'Basic ' + appConfig.ccpSecretKey,
    verifyUrl: appConfig.ccpSsoHostname + '/oauth/token',
    charInfoUrl: appConfig.ccpSsoHostname + '/oauth/verify',

}

function auth(authCode) {
    var promise = verifyCode(authCode);
    promise = promise.then(getCharacterInfo);
    return promise;
}

function verifyCode(authCode) {

    var deferred = q.defer();
    request.post(config.verifyUrl, {
        headers: {
            'Authorization': config.basicAuthHeader
        },
        form: {
            'grant_type': 'authorization_code',
            'code': authCode
        }
    },
    function (err, response, body) {
        try { body = JSON.parse(body) } catch (e) { }
        if (body && body.error_description) {
            deferred.reject(body.error_description);
        }
        else if (err || !body || !body.access_token) {
            deferred.reject("Unknown error");
        }
        else {
            deferred.resolve(body.access_token);
        }
    });
    return deferred.promise;
}

function getCharacterInfo(accessToken) {
    var authHeader = 'Bearer ' + accessToken;

    var deferred = q.defer();
    request(config.charInfoUrl, {
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    },
    function (err, response, body) {
        try { body = JSON.parse(body) } catch (e) { }
        if (body && body.error_description) {
            deferred.reject(body.error_description);
        }
        else if (err || !body || !body.CharacterID) {
            deferred.reject("Unknown error");
        }
        else {
            deferred.resolve(body);
        }
    });
    return deferred.promise;
}


auth.wrappedAuth = function (authCode) {
    auth(authCode).then(function (msg) {
        console.log("Success:", msg);
    })
    .catch(function (err) {
        console.log("Fail:", err);
    });
};

module.exports = auth;