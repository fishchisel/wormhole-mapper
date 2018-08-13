'use strict';

var wormholeClassRepository = require('local/repositories/wormhole-class');

var me = function ($compile) {

    var directive = {
        restrict: "A",
        priority: 1000,
        terminal: true
    }
    directive.scope = {
        wormholeSearch: '=',
        usrSearchQuery: '=searchQuery',
        useId: '&wormholeSearchUseId',
        initialSearch: '='
    }
    directive.controller = ['$scope', function ($scope) {
        $scope.wormholeSearch = $scope.wormholeSearch ? $scope.wormholeSearch : null;

        if ($scope.wormholeSearch) {
            if ($scope.useId) {
                var whc = wormholeClassRepository.getWormholeClass($scope.wormholeSearch);
                $scope.searchQuery = whc ? whc.className : "";
            }
            else {
                $scope.searchQuery = $scope.wormholeSearch.className;
            }
        }
        else
            $scope.searchQuery = $scope.initialSearch;


        $scope.search = function (query, maxResults) {
            return wormholeClassRepository.searchWormholeClasses(query, maxResults, true);
        };
        $scope.$watch('usrSearchQuery', function (value) {
            if (value !== undefined && value != $scope.searchQuery)
                $scope.searchQuery = value;
        });
        $scope.$watch("searchQuery", function (value) {
            if ($scope.usrSearchQuery !== undefined)
                $scope.usrSearchQuery = value;

            var val = wormholeClassRepository.getWormholeClass(value);
            if (val) {
                $scope.wormholeSearch = $scope.useId ? val.className : val;
            }
            else {
                $scope.wormholeSearch = null;
            }
        });
    }];
    directive.link = function (scope, element, attrs) {
        element.attr('typeahead', 'wc.className for wc in search($viewValue,5)');
        element.attr('ng-model', 'searchQuery');

        element.removeAttr('wormhole-search');
        element.removeAttr('data-wormhole-search');

        $compile(element)(scope);
    }

    return directive;
};

module.exports = me;