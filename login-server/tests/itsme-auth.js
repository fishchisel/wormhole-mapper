'use strict';

var expect = require('chai').expect;

var itsmeAuth = require('../app/itsme-auth');

describe('Itsme Auth test', function () {

    it("Fails on empty character Id", function (done) {

        itsmeAuth().fail(function (message) {
            done();
        })
    });

    it("Success on valid character Id", function (done) {

        itsmeAuth(93563522).then(function (res) {
            expect(res.id).equal(935603363);
            done();
        }).fail(function (x) { console.log(x) });

    });

    it("Should be admin", function (done) {

        itsmeAuth(1516710496).then(function (res) {
            expect(res.isAdmin).equal(true);
            done()
        });


    });

});