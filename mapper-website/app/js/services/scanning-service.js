'use strict';

var signatureRepository = require('local/repositories/signature');
var wormholeRepository = require('local/repositories/wormhole');
var scannedSystemRepository = require('local/repositories/scanned-system');

var signatureParserService = require('./signature-parser-service');


var me = {}

me.makeSystemObservation = function (system, partial) {
	var sys = scannedSystemRepository.getSystem(system.id);

	if (partial)
		sys.lastPartialScan = new Date().getTime();
	else
		sys.lastScanned = new Date().getTime();

	scannedSystemRepository.updateSystem(sys);
}

me.makeSignatureObservation = function (signature) {
	signature.lastScanned = new Date().getTime();
	signatureRepository.updateSignature(signature);
}
me.makeWormholeObservation = function (wormhole) {
	wormhole._lastObserved = new Date().getTime();
	wormholeRepository.update(wormhole);
}

me.getWormholesWithSignatures = function (system) {
	var whs = system.getWormholes();
	var sigs = system.getSignatures();

	return whs.map(function (w) {
		var sig = sigs.find(function (s) { return s.wormholeId == w.id });
		return { wormhole: w, signature: sig };
	});
}

me.getUnusedSignatures = function (system, type) {
	var whs = system.getWormholes();
	var sigs = system.getSignatures();

	return sigs.filter(function (sig) {
		if (type && sig.type != type)
			return false
		return !whs.some(function (wh) { return wh.id == sig.wormholeId; });
	});
}

me.saveWormholeWithSignature = function (wormhole, oldSig, newSig) {
	if (wormhole.id) {
		var id = wormhole.id;
		wormholeRepository.update(wormhole);
		setSignature(oldSig, newSig, id);
	} else {
		wormholeRepository.create(wormhole).then(function (id) {
			setSignature(oldSig, newSig, id);
		});
	}
}
function setSignature(oldSig, newSig, id) {
	if (oldSig) {
		oldSig.wormholeId = undefined;
		signatureRepository.updateSignature(oldSig);
	}

	if (newSig) {
		newSig.wormholeId = id;
		signatureRepository.updateSignature(newSig);
	}
}

me.pasteSignatureData = function (currentSystem, pastedData) {

	var newSigs = signatureParserService.getSignatures(currentSystem.id, pastedData);

	if (!newSigs || newSigs.length == 0) return false;

	var existingSigs = currentSystem.getSignatures();

	var addSigs = [];
	var updateSigs = [];
	newSigs.forEach(function (sig) {
		var existingSig = existingSigs.find(function (x) { return x.equals(sig) });
		if (existingSig) {
			existingSig.type = sig.type ? sig.type : existingSig.type;
			existingSig.lastScanned = new Date().getTime();
			updateSigs.push(existingSig);
		}
		else {
			addSigs.push(sig);
		}
	});

	signatureRepository.supressChanged(true);
	addSigs.forEach(function (sig) {
		signatureRepository.createSignature(sig);
	});
	updateSigs.forEach(function (sig) {
		signatureRepository.updateSignature(sig);
	});
	signatureRepository.supressChanged(false);

	var partialUpdated = updateSigs.some(function (sig) { return !sig.type; });
	var partialAdded = addSigs.some(function (sig) { return !sig.type; });
	var partial = partialUpdated || partialAdded;

	me.makeSystemObservation(currentSystem, partial);
	return true;
}


module.exports = me;


