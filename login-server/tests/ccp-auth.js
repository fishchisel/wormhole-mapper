'use strict';

var expect = require('chai').expect;

var ccpAuth = require('../app/ccp-auth');

describe('CCP Auth test', function () {

    it("Fails on empty token", function (done) {
        
        ccpAuth().fail(function (message) {
            expect(message).equal("The code parameter is missing");
            done();
        })
    });

    it("Fails on bad token", function (done) {
        ccpAuth("asdasdas").fail(function (message) {
            expect(message).equal("Invalid authorization code, decrypt failed");
            done();
        });
    });

});