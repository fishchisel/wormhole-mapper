'use strict';

var expect = require('chai').expect;

var Wormhole = require('local/repositories/wormhole/wormhole.js'),
    wrmRep = require('local/repositories/wormhole'),
    leaderboardRep = require('local/repositories/leaderboard'),
    q = require('q');

var whLogger = require('../../app/leaderboard-creator/wormhole-logger');



describe("Wormhole leaderboard generation", function () {

    before(function (done) {
        this.timeout(0);
        q.all([wrmRep.initialize(), leaderboardRep.initialize()]).then(function () {
            console.log("done setup");
            done();
        })
    })


    it("Should generated leaderboard records from empty wormhole", function (done) {
        this.timeout(0);

        var wh = new Wormhole();
        wh.startSystemId = 30000158;
        wh.endSystemId = 30000158;
        wh.log = {}
        wh.log[Date.now()] = { id: 999, type: 'c' };

        // all setup
        q.all([wrmRep.initialize(), leaderboardRep.initialize()]).then(function () {

            var rec = leaderboardRep.get(999);
            rec.days = {};

            leaderboardRep.update(rec);

            return wrmRep.create(wh);
        }).then(function (id) {

            var wh = wrmRep.get(id);

            return whLogger.checkWormhole(wh)
        })

        //the test
        .done(function () {

            var result = leaderboardRep.get(999).days;

            expect(Object.keys(result).length).equal(1);

            result = result[Object.keys(result)[0]];

            expect(result.wormholesAdded).equal(1);
            expect(result.wormholesPartCompleted).equal(0);
            expect(result.wormholesCompleted).equal(0);

            done();
        });
    });



});

