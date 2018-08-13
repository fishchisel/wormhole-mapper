'use strict';

var systemRepository = require('local/repositories/system');
var scannedSystemRepository = require('local/repositories/scanned-system');
var wormholeRepository = require('local/repositories/wormhole');
var signatureRepository = require('local/repositories/signature');

var scanningService = require('../../services/scanning-service');
var routeSearchParamsService = require('../../services/route-search-params-service.js');

var Signature = require('local/repositories/signature/signature.js');
var ScannedSystem = require('local/repositories/scanned-system//scanned-system');


var ScannedSystemDetails = function (sys) {
	this.data = sys;
	this.id = sys.id;
	this.name = sys.systemName;
	this.lastScannedPretty = sys.getLastScannedPretty();
	this.lastScannedFuzzy = sys.getLastScannedFuzzy();
	this.lastPartialScanPretty = sys.getLastPartialScanPretty();
	this.lastPartialScanFuzzy = sys.getLastPartialScanFuzzy();

	this.security = sys.getSecurityPretty();
	this.region = sys.regionName;
	this.numWormholes = sys.getWormholes().length;

	this.dotlanLink = "http://evemaps.dotlan.net/system/" + this.name;
	this.wormhol_esLink = "http://wh.pasta.gg/" + this.name;
	this.eveeyeLink = "https://eveeye.com/?opt=W&system=" + this.name;

	this.isWspace = sys.isWormholeSpace();

	var homeSystem = siteConfig.homeSystem;
	this.homeSystem = homeSystem.systemName;
	this.distance = sys.getStaticJumpsToSystem(homeSystem);
	if (this.distance === null)
		this.distance = "\u221E";

	this.note = sys.note;

	this.connectedSystems = sys.getGates();
};

var WormholeDetails = function (wormhole, thisSystem, signature) {
	this.wormhole = wormhole;
	this.signature = signature;

	this.newSig = this.signature;

	if (wormhole.startSystemId == thisSystem.id) {
		this.destination = wormhole.getEndSystem();
		this.destType = "end";
	}
	else if (wormhole.endSystemId == thisSystem.id) {
		this.destination = wormhole.getStartSystem();
		this.destType = "start";
	}

	this.wormholeClass = wormhole.getWormholeClass();
	this.id = this.signature ? this.signature.id : "-";

	this.staticJumps = wormhole.getStaticJumps();
	this.staticJumpsNoHighsec = wormhole.getStaticJumpsNoHighsec();
	var infinity = "\u221E";
	this.equivJumps = this.staticJumps ? this.staticJumps : infinity;
	this.equivLowsecJumps = this.staticJumpsNoHighsec ? this.staticJumpsNoHighsec : infinity;
		
	var usr = wormhole.getCreator();
	this.user = usr ? usr.name : null;

	this.note = wormhole.getShortNote();
	this.longNote = wormhole.noteIsShort() ? null : wormhole.note;
}
WormholeDetails.prototype.isDuplicate = function () {
    return this.wormhole.hasDuplicate();
}

var SignatureDetails = function (sig) {
	this.sig = sig;

	this.note = sig.getShortNote();
	this.longNote = sig.noteIsShort() ? null : sig.note;
}

var ctrl = function ($scope, $state, $stateParams, $q) {

    var system = systemRepository.getSystemByName($stateParams.systemName);
    if (!system) {
        $state.go('system-list');
        return;
    }
    $scope.$parent.setSelected(system);

    //-------------------------------------------------------------------------------------
    // Setup
    var scannedSystem;

    var promises = $q.all(
        [scannedSystemRepository.initialize(),
         wormholeRepository.initialize(),
         signatureRepository.initialize()]);

    promises.then(function () {
        var sys = scannedSystemRepository.getSystem(system.id);
        scannedSystemRepository.systemChanged(system.id, sysChanged);
        sysChanged(sys);
    });

    function sysChanged(newSys) {
        scannedSystem = newSys;
        displaySystem(scannedSystem);
    }

    function displaySystem(scannedSystem) {
        $scope.sys = new ScannedSystemDetails(scannedSystem);

        var sigs = scanningService.getUnusedSignatures(system);

        var wormholes = scanningService.getWormholesWithSignatures(scannedSystem);

        $scope.wormholes = wormholes.map(function (item) {
            return new WormholeDetails(item.wormhole, system, item.signature);
        });
        $scope.sigs = sigs.map(function (s) {
            return new SignatureDetails(s);
        });
        $scope.show = true;
    }

    $scope.sigTypes = Signature.allowedTypes;

    //-------------------------------------------------------------------------------------
    // Functions on the system itself

    $scope.togglePinned = function () {
        scannedSystem.isPinned = !scannedSystem.isPinned;
        scannedSystemRepository.updateSystem(scannedSystem);
    }
    $scope.toggleStarred = function () {
        scannedSystem.isStarred = !scannedSystem.isStarred;
        scannedSystemRepository.updateSystem(scannedSystem);
    }

    $scope.toggleEditNote = function () {
        if (!$scope.editingNote)
            $scope.newNote = $scope.sys.note;
        $scope.editingNote = !$scope.editingNote;
    }
    $scope.isSafeNoteLength = function () {
        return !$scope.newNote || $scope.newNote.length < ScannedSystem.MAX_NOTE_LENGTH;
    }
    $scope.saveNote = function () {
        scannedSystem.note = $scope.newNote;
        $scope.toggleEditNote();
        scannedSystemRepository.updateSystem(scannedSystem);
    }

    $scope.markAsScanned = function () {
        scanningService.makeSystemObservation(system);
    }

    $scope.findRouteTo = function () {
        var home = siteConfig.homeSystem;
        var dest = system;
        routeSearchParamsService.setSystems(home, dest);
        $state.go('route-finder');
    }

    $scope.togglePasteSignatues = function () {
        $scope.pastingScanResults = !$scope.pastingScanResults;
    }
    $scope.pasteScanResults = function () {
        if (!$scope.pastedScanResultData) {
            $scope.pastingScanResults = false;
            return;
        }

        var data = $scope.pastedScanResultData;
        $scope.pastedScanResultData = null;

        var success = scanningService.pasteSignatureData(system, data);
        if (!success) {
            alert("Couldn't parse signatures. Did you paste the correct data?");
        }
        else {
            $scope.pastingScanResults = false;
        }
    }

    $scope.todo = function () {
        alert("Unimplemented");
    }

    $scope.go = function (dest) {
        $state.go('system-list.details', { systemName: dest.systemName });
    }

    //-------------------------------------------------------------------------------------
    // functions for saving/deleting wormholes

    $scope.newWormhole = function () {
        $scope.wormholes.forEach(function (s) { s.isEditing = false; });
        $scope.showNewWormhole = true;
    }
    $scope.editWormhole = function (wh) {
        $scope.showNewWormhole = false;
        if (wh.isEditing)
            wh.isEditing = false;
        else {
            $scope.wormholes.forEach(function (s) { s.isEditing = false; });
            wh.isEditing = true;
        }
    }
    $scope.deleteWormhole = function (wh) {
        wormholeRepository.delete(wh);
    }
    $scope.closeWormhole = function () {
        $scope.showNewWormhole = false;
        $scope.wormholes.forEach(function (s) { s.isEditing = false; });
    }
    $scope.observeWormhole = function (wh) {
        scanningService.makeWormholeObservation(wh);
    }

    //-------------------------------------------------------------------------------------
    // functions for saving/deleting signatures

    $scope.newSig = function () {
        $scope.sigs.forEach(function (s) { s.isEditing = false; });
        $scope.showNewSig = true;
    }
    $scope.editSig = function (sig) {
        $scope.showNewSig = false;
        if (sig.isEditing)
            sig.isEditing = false;
        else {
            $scope.sigs.forEach(function (s) { s.isEditing = false; });
            sig.isEditing = true;
        }
    }
    $scope.deleteSig = function (sig) {
        signatureRepository.deleteSignature(sig);
    }
    $scope.closeSig = function () {
        $scope.showNewSig = false;
        $scope.sigs.forEach(function (s) { s.isEditing = false; });
    }
    $scope.observeSig = function (sig) {
        scanningService.makeSignatureObservation(sig);
    }



    $scope.$on('$destroy', function () {
        $scope.$parent.setSelected(null);
        scannedSystemRepository.systemChangedRemoveHandler(system.id, sysChanged);
    });
};

module.exports = ctrl;