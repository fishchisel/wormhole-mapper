var http = require('http');
var request = require('request');
var q = require('q');

var URL = "http://www.eve-scout.com/api/wormholes?limit=1000"


function fetch() {
    var deferred = q.defer();

    request.get({
        url: URL,
        timeout: 5000        
    }, function (err, response, body) {

        try { body = JSON.parse(body) } catch (e) { }
        if (err) {
            deferred.reject(err);
        }
        else if (!body) {
            deferred.reject("Unknown error")
        }
        else {
            try { var parsed = parseEveScout(body)}
            catch (e) {
                deferred.reject(e);
                return;
            }
            deferred.resolve(parsed);
        }
    });

    return deferred.promise;
}

function parseEveScout(json) {
    
    var output = json.map(function (inWormhole) {
        try {
            var outWormhole = {
                id: inWormhole.id,
                startSystemSignature: inWormhole.signatureId,
                startSystemId: inWormhole.solarSystemId,
                endSystemSignature: inWormhole.wormholeDestinationSignatureId,
                endSystemId: inWormhole.wormholeDestinationSolarSystemId,
                dateFound: Date.parse(inWormhole.createdAt),
                updatedAt: Date.parse(inWormhole.updatedAt)
            }
            if (inWormhole.sourceWormholeType.name == "K162")
                outWormhole.wormholeClassName = inWormhole.destinationWormholeType.name
            else
                outWormhole.wormholeClassName = inWormhole.sourceWormholeType.name

            return outWormhole;
        }
        catch (e) {
            return null;
        }
    });

    output = output.filter(function (x) { return x !== null });
    return output;
}

fetch.wrapped = function () {

    fetch().then(function (x) {
        console.log(x);
    }).fail(function (x) {
        console.log(x);
    });
}

module.exports = fetch;