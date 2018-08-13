'use strict';

var signatureRepository = require('local/repositories/signature');
var Signature = require('local/repositories/signature/signature.js');

var me = function () {

    var directive = {
        templateUrl: 'views/directives/system-list.details.edit-signature.html'
    };

    directive.scope = {
        targetSignature: '=editSignature',
        systemId: '=signatureSystemId',
        parentClose: '&onClose',
    }
    directive.controller = ['$scope', function ($scope) {
        if (!$scope.systemId) throw "must set systemId";

        if ($scope.targetSignature) {
            $scope.isExisting = true;
            $scope.signature = $scope.targetSignature.clone();
        }
        else {
            $scope.signature = new Signature();
        }

        $scope.allowedTypes = Signature.allowedTypes;

        $scope.canSave = function () {
            if (!$scope.signature.id)
                return false;
            var newId = $scope.signature.id.toUpperCase().trim();
            return newId.match(/^[A-Z0-9\-]+$/)
        }

        $scope.save = function () {
            if (!$scope.canSave()) return;

            var sig = $scope.signature;
            sig.systemId = $scope.systemId;
            signatureRepository.updateSignature(sig);
            $scope.close();
        }

        $scope.close = function () {
            if ($scope.parentClose) {
                $scope.parentClose();
            }
        }
    }];
    return directive;
}

module.exports = me;