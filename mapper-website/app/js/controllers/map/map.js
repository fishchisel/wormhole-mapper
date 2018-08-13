var sysRep = require('local/repositories/system'),
    scannedSysRep = require('local/repositories/scanned-system'),
    wrmRep = require('local/repositories/wormhole'),
    pathfinder = require('local/pathfinder');

var SigmaJsService = require('../../services/sigma-js-service');

var q = require('q');

module.exports = function ($scope, $state) {
    $scope.setBodyClass('hide-background-image');

    //$scope.systemTypes = {
    //    'Highsec': true,
    //    'Lowsec': true,
    //    'Nullsec': true,
    //};

    q.all([
        sysRep.initialize(),
        wrmRep.initialize(),
        scannedSysRep.initialize(),
    ]).done(function() {
        var elm = document.getElementById('sigma-container');

        var s = new SigmaJsService(elm);
        s.createData(sysRep.getSystemsArray(), wrmRep.getArray());
        s.render();
    });

    $scope.$on('$destroy', function () {
        $scope.setBodyClass(null);
    });
};


//function renderMap(sigmaMap, parameters) {
//    var hi = parameters.systemTypes['Highsec'] ? 0 : 2;
//    var lo = parameters.systemTypes['Lowsec'] ? 0 : 2;
//    var nl = parameters.systemTypes['Nullsec'] ? 0 : 2;

//    sigmaMap.graph.clear();


//    pathfinder.findDistances({
//        startSys: siteConfig.homeSystem,
//        wormholes: wrmRep.getArray(),
//        bridges: [],
//        highsec: hi,
//        lowsec: lo,
//        nullsec: nl
//    });
//}