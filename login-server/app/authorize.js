'use strict';

var ccpAuth = require('./ccp-auth'),
    itsmeAuth = require('./itsme-auth'),
    localAuth = require('./local-auth'),
    makeFirebaseToken = require('./make-firebase-token');

var authRep = require('local/repositories/authorization'),
    getCharacterInfo = require('local/eve-api/character-info'),
    loginLogRep = require('local/repositories/login-log');

var config = require('./config');

var q = require('q');

/**
 * Returns a promise that resolves to an object as below. Rejection implies unauthorized.
 * {
 *    characterInfo: {}, // see local/eve-api/character-info
 *    isAdmin: false,
 * }
 *
 */
function authorize(authCode) {
    var deferred = q.defer();

    var givenCharacterId;

    var promise = ccpAuth(authCode)
        .then(function (info) {
            var id = info.CharacterID;
            givenCharacterId = id;

            // access from db
            var localPromise = getCharacterInfo(id).then(function (info) {
                return localAuth(info);
            })

            // access from itsme
            if (config.itsmeUrl) {
                var itsmePromise = itsmeAuth(id);
            }
            else {
                var def = q.defer();
                def.reject();
                var itsmePromise = def.promise;
            }

            // access from config group
            var def = q.defer();
            getCharacterInfo(id).then(function (info) {
                var adminCharacters = config.adminCharacters ? config.adminCharacters : [];
                if (adminCharacters.indexOf(id) > -1) {
                    def.resolve({
                        characterInfo: info,
                        isAdmin: true
                    });
                }
                else {
                    def.reject();
                }
            });
            var configPromise = def.promise;


            return q.allSettled([itsmePromise, localPromise, configPromise]);
        })
        .spread(function (itsmeResult, localResult, configResult) {

            if (itsmeResult.state == "fulfilled") {
                var id = itsmeResult.value.id;
                var isAdmin = itsmeResult.value.isAdmin;

                return getCharacterInfo(id).then(function (charInfo) {
                    return {
                        characterInfo: charInfo,
                        isAdmin: isAdmin
                    }
                });
            }
            else if (localResult.state == "fulfilled") {
                return {
                    characterInfo: localResult.value,
                    isAdmin: false
                }
            }
            else if (configResult.state == "fulfilled") {
                return configResult.value;
            }
            return null;
        })
        .then(function (details) {
            if (!details) return null;

            var adminCharacters = config.adminCharacters ? config.adminCharacters : [];
            var id = givenCharacterId;

            var isAdminFromConfig = adminCharacters.indexOf(id) > -1;
            if (isAdminFromConfig) {
                details.isAdmin = true;
            }
            return details;
        })
        .then(function (details) {
            if (!details) return null;

            var token = makeFirebaseToken(details.characterInfo.id, details.isAdmin);
            return {
                characterInfo: details.characterInfo,
                token: token
            }
        })
        .then(function (result) {
            if (result && result.characterInfo && result.token) {
                deferred.resolve(result);
                getCharacterInfo(givenCharacterId).then(function (initialCharInfo) {
                    loginLogRep.set(
                        result.characterInfo.id,
                        result.characterInfo.name,
                        initialCharInfo.id,
                        initialCharInfo.name);
                });
            }
            else {
                deferred.reject("Given character is not allowed access");
            }
        })
        .fail(function (error) {
            if (error) {
                console.error(error);
                console.error(error.stack);
            }
            deferred.reject(error);
        });

    return deferred.promise;
}

authorize.wrapped = function (authCode) {
    var repositories = require('local/repositories'),
        config = require('./config.js'),
        authorize = require('./authorize.js'),
        dbLogin = require('local/server-login');

    repositories.setFirebaseUrl(config.firebaseUrl);

    dbLogin("login-server", config.firebaseSecretKey).then(function () {
        authorize(authCode).then(function (msg) {
            console.log("Success:", msg);
        })
        .catch(function (err) {
            console.log("Fail:", err);
            console.log("Stack trace:", err.stack);
        });
    });
};

module.exports = authorize;