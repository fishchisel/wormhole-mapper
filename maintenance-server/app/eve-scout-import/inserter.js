var importRecordRep = require('local/repositories/wormhole-import-record');
var wormholeRep = require('local/repositories/wormhole');
var signatureRep = require('local/repositories/signature');
var scannedSystemRep = require('local/repositories/scanned-system');

var Wormhole = require('local/repositories/wormhole/wormhole.js');
var Signature = require('local/repositories/signature/signature.js');

var q = require('q');

function insert(data) {

    var def = q.all([
        importRecordRep.initialize(),
        wormholeRep.initialize(),
        signatureRep.initialize(),
        scannedSystemRep.initialize()]);


    return def.then(function () {
        var count = 0;
        for (var i = 0; i < data.length; i++) {

            var newWormhole = data[i];

            if (!isComplete(newWormhole))
                continue;

            if (!testIfNew(newWormhole))
                continue;

            addWormhole(newWormhole);
            record(newWormhole);
            count++;
        }
        return count;
    });
}

function isComplete(wormhole) {
    return wormhole.startSystemSignature
        && wormhole.startSystemId
        && wormhole.endSystemSignature
        && wormhole.endSystemId
        && wormhole.wormholeClassName
}

function testIfNew(newWormhole) {
    var id = newWormhole.id;

    var allImportRecords = importRecordRep.getArray();

    return !allImportRecords.some(function (x) {
        return x.foreignId == id && x.type == "eve-scout";
    });
}

function addWormhole(newWormhole) {

    var wormhole = new Wormhole();

    wormhole.startSystemId = newWormhole.startSystemId;
    wormhole.endSystemId = newWormhole.endSystemId;
    wormhole.wormholeClassName = newWormhole.wormholeClassName;
    wormhole._dateFound = newWormhole.dateFound;
    wormhole._lastObserved = newWormhole.updatedAt;


    var id = wormholeRep.create(wormhole);
    var a = makeSig(
        newWormhole.startSystemId,
        newWormhole.startSystemSignature,
        id);
    var b = makeSig(
        newWormhole.endSystemId,
        newWormhole.endSystemSignature,
        id);
    signatureRep.createSignature(a);
    signatureRep.createSignature(b);
}

function makeSig(sysId, sigId, wId) {
    var sig = new Signature();
    sig.id = sigId;
    sig.systemId = sysId;
    sig.wormholeId = wId;
    sig.type = "wormhole";
    return sig;
}

function record(newWormhole) {
    importRecordRep.set("eve-scout", newWormhole.id);
}

module.exports = insert;
