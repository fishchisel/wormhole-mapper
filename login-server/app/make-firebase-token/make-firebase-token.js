'use strict';

var FirebaseTokenGenerator = require("firebase-token-generator");

var config = require('../config');

var secretKey = config.firebaseSecretKey;
var sessionLengthHrs = config.firebaseSessionLengthHours;


function generateToken(userId, isAdmin) {

    try {
        var tokenGenerator = new FirebaseTokenGenerator(secretKey);

        var epocMs = (new Date()).getTime();
        var epocSecs = epocMs / 1000;

        var expireAddition = sessionLengthHrs * 60 * 60;

        var expiry = epocSecs + expireAddition;

        var token = tokenGenerator.createToken({
            uid: String(userId),
            isAdmin: isAdmin
        },
        {
            expires: expiry
        });
        return token;
    }
    catch (e) {
        console.error(e);
        return null;
    }
}

if (require.main === module) {
    var tok = generateToken(935603363, true);
    console.log(tok);
}


module.exports = generateToken;