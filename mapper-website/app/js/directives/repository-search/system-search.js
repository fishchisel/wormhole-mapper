'use strict';

var systemRepository = require('local/repositories/system');

var me = function ($compile) {

    var directive = {
        restrict: "A",
        priority: 1000,
        terminal: true
    }
    directive.scope = {
        systemSearch: '=',
        usrSearchQuery: '=searchQuery',
        useId: '@systemSearchUseId',
        initialSearch: '='
    }
    directive.controller = ['$scope','$timeout', function ($scope, $timeout) {
        $scope.systemSearch = $scope.systemSearch ? $scope.systemSearch : null;

        if ($scope.systemSearch) {
            if ($scope.useId) {
                var sys = systemRepository.getSystem($scope.systemSearch);
                $scope.searchQuery = sys ? sys.systemName : "";
            }
            else {
                $scope.searchQuery = $scope.systemSearch.systemName
            }
        }
        else
            $scope.searchQuery = $scope.initialSearch;

        $scope.search = function (query, maxResults) {
            return systemRepository.searchSystems(query, maxResults, true);
        };
        $scope.$watch('systemSearch', function (value) {
            if (value && $scope.usrSearchQuery !== undefined) {
                $scope.usrSearchQuery = value.systemName;
            }
        });

        $scope.$watch('usrSearchQuery', function (value) {
            if (value !== undefined && value != $scope.searchQuery)
                $scope.searchQuery = value;
        });
        $scope.$watch("searchQuery", function (value) {
            if ($scope.usrSearchQuery !== undefined)
                $scope.usrSearchQuery = value;
            var val = systemRepository.getSystemByName(value);
            if (val) {
                $scope.systemSearch = $scope.useId ? val.id : val;
            }
            else {
                $scope.systemSearch = null;
            }
        });
    }]
    directive.link = function (scope, element, attrs) {
        element.attr('typeahead', 'system.systemName for system in search($viewValue,5)');
        element.attr('ng-model', 'searchQuery');

        element.removeAttr('system-search');
        element.removeAttr('data-system-search');

        $compile(element)(scope);
    }

    return directive;
};

module.exports = me;