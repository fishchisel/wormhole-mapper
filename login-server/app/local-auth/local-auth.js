'use strict';

var authRep = require('local/repositories/authorization');

var q = require('q');

function auth(characterDetails) {

    var charId = characterDetails.id;
    var corpId = characterDetails.corporationId;
    var allianceId = characterDetails.allianceId;

    var deferred = q.defer();

    authRep.initialize().then(function () {
        var auths = authRep.getArray();
        var allowed = auths.some(function (x) {
            if (x.id == charId && x.type == "character") return true;
            if (x.id == corpId && x.type == "corporation") return true;
            if (x.id == allianceId && x.type == "alliance") return true;
        });

        if (allowed) deferred.resolve(characterDetails);
        else deferred.reject("Character not authorized.");
    }).fail(function (x) {
        console.log(x);
    });

    return deferred.promise;
}

auth.wrapped = function () {
    var config = require('../config.js');
    var dbLogin = require('local/server-login');

    require('local/repositories').setFirebaseUrl(config.firebaseUrl);

    var dtls = { id: 238450262, corporationId: 1512797984 };

    dbLogin("login-server", config.firebaseSecretKey).then(function () {
        return auth(dtls);
    })
    .then(function (x) {
        console.log(x);
    }).fail(function (x) {
        console.log(x);
    });
}

module.exports = auth;