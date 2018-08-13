'use strict';

var userRepository = require('local/repositories/user'),
    principal = require('local/repositories/firebase-auth');

var q = require('q');

var me = {}

me.getCurrentUser = function () {

    return principal.identity().then(function(identity) {
        if (!identity)
            return null;
        
        return userRepository.initialize().then(function () {
            var user = userRepository.get(identity.uid);
            return user;
        });   
    })

}

me.login = function (token, characterDetails) {


    return principal.loginWithFirebase(token)
        .then(function () {
            if (characterDetails) {
                return userRepository.initialize().then(function () {
                    var me = userRepository.get(characterDetails.id);

                    if (!me) me = { id: characterDetails.id };

                    me.name = characterDetails.name;
                    me.corporation = characterDetails.corporation;
                    me.alliance = characterDetails.alliance;
                    me.lastLogin = Date.now();

                    userRepository.update(me);
                });
            }
        });
}



module.exports = me;