'use strict';

var routeSearchParamsService = require('../../services/route-search-params-service');
var userService = require('../../services/user-service.js');
var userRepository = require('local/repositories/user');
var l = require('local/repositories/route-log/l.js');

module.exports = function ($scope, $state, $timeout) {

    routeSearchParamsService.initialize().done(function () {
        $scope.safeApply(function () {
            routeSearchParamsService.getParamsToEditor($scope);
        });
    })

    // setup watchers
    $scope.$watch('systemTypes', transitionIfNeeded, true);
    $scope.$watch('transportMethods', transitionIfNeeded, true);
    $scope.$watch('minBridgeDistance', transitionIfNeeded);
    $scope.$watch('maxResults', transitionIfNeeded);
    $scope.$watchGroup(['startSystem', 'endSystem'], transitionIfNeeded);

    $scope.reverse = function () {
        var rev = $scope.startSystem;
        $scope.startSystem = $scope.endSystem;
        $scope.endSystem = rev;
    }

    function transitionIfNeeded() {
        routeSearchParamsService.setParams($scope);
        if ($scope.startSystem && $scope.endSystem) {
            var prms = routeSearchParamsService.getParamsForFinder();
            prms.start = $scope.startSystem;
            prms.end = $scope.endSystem;

            logUse(prms.start,prms.end)

            $state.go('route-finder.find', prms);
        } else {
            $state.go('route-finder');
        }
    };

    function logUse(start,end) {
        userService.getCurrentUser().done(function (user) {
            if (!user) return;
            user.routesSearched++;
            userRepository.update(user);

            l(user.id, start.id, end.id);
        });
    }
};