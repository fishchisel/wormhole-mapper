'use strict';

var signatureRepository = require('local/repositories/signature'),
    systemRepository = require('local/repositories/system'),
    scanningService = require('../../services/scanning-service');

var Wormhole = require('local/repositories/wormhole/wormhole.js');

var me = function () {

    var directive = {
        templateUrl: 'views/directives/system-list.details.edit-wormhole.html'
    };

    directive.scope = {
        targetWormhole: '=editWormhole',
        currSig: '=currentSignature',
        systemId: '=thisSystemId',
        parentClose: '&onClose',
    }
    directive.controller = ['$scope', function ($scope) {
        if (!$scope.systemId) throw "must set thisSystemId";

        if ($scope.targetWormhole) {
            $scope.isExisting = true;
            $scope.wormhole = $scope.targetWormhole.clone();
            $scope.eolState = !!$scope.targetWormhole.eolTime; // only used on initial load
            $scope.sig = $scope.currSig;
            if ($scope.wormhole.startSystemId === $scope.systemId)
                $scope.destination = $scope.wormhole.getEndSystem();
            else
                $scope.destination = $scope.wormhole.getStartSystem();
        }
        else {
            $scope.wormhole = new Wormhole();
            $scope.wormhole.startSystemId = $scope.systemId;
        }
			
        var sys = systemRepository.getSystem($scope.systemId);
        $scope.allowedSigs = scanningService.getUnusedSignatures(sys,'wormhole');
        if ($scope.sig)
            $scope.allowedSigs.push($scope.sig);
        $scope.allowedSigs = $scope.allowedSigs.sort(function (a, b) {
            return a.id < b.id ? -1 : 1
        });

        $scope.canSave = function () {
            return $scope.destination && !$scope.wormhole.noteIsTooLong();
        }

        $scope.toggleEol = function () {
            if ($scope.wormhole.eolTime)
                $scope.wormhole.eolTime = null;
            else
                $scope.wormhole.eolTime = Date.now();
        }

        $scope.save = function () {
            if (!$scope.canSave()) return;

            if ($scope.wormhole.startSystemId === $scope.systemId)
                $scope.wormhole.endSystemId = $scope.destination.id;
            else
                $scope.wormhole.startSystemId = $scope.destination.id;

            scanningService.saveWormholeWithSignature($scope.wormhole, $scope.currSig, $scope.sig);
            $scope.close();
        }

        $scope.close = function () {
            if ($scope.parentClose) {
                $scope.parentClose();
            }
        }
    }]
    return directive;

}

module.exports = me;