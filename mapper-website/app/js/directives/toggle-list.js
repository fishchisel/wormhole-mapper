'use strict';

var me = function () {

    var directive = {};

    directive.templateUrl = 'views/directives/toggle-list.html';

    directive.scope = {
        data: '=toggleList',
        threeValue: '@threeValue'
    }
    directive.controller = ['$scope', function ($scope) {
        var data = $scope.data;
        var threeValue = $scope.threeValue ? true : false;

        $scope.test = "Test content";

        $scope.getName = function (key) {
            if (_isComplexEntry($scope.data[key])) {
                return $scope.data[key]["name"];
            }
            return key;
        }
        $scope.getValue = function (key) {
            if (_isNestedEntry($scope.data[key]))
                return _getValueGroup($scope.data[key]);
            else
                return _getValue($scope.data[key])
        }

        $scope.toggle = function (key) {
            if (_isNestedEntry($scope.data[key]))
                _toggleGroup($scope.data[key]);
            else
                _toggle($scope.data, key);
        }

        $scope.isNested = function (key) {
            return _isNestedEntry($scope.data[key]);
        }

        function _getValue(item) {
            if (_isComplexEntry(item)) {
                return item["value"];
            }
            return item;
        }
        function _getValueGroup(item) {
            var childItems = Object.keys(item).map(function (x) { return item[x] });

            var testFunc = (function (x) { return _getValue(x); });
            if (childItems.every(testFunc))
                return "all";
            if (childItems.some(testFunc))
                return "some";
            return "none";
        }

        function _toggle(data, key) {
            if (threeValue) {
                data[key]++;
                if (data[key] > 2) data[key] = 0;
            }
            else if (_isComplexEntry(data[key]))
                data[key]["value"] = !data[key]["value"];
            else {
                data[key] = !data[key];
            }
        }
        function _toggleGroup(group) {
            var val = _getValueGroup(group);
            var newVal = !(val === "some" || val === "all");

            Object.keys(group).forEach(function (k) {
                if (_isComplexEntry(group[k]))
                    group[k]["value"] = newVal;
                else {
                    group[k] = newVal;
                }
            });
        }

        function _isComplexEntry(value) {
            if (typeof (value) !== "object")
                return false;
            return value["value"] !== undefined;
        }

        function _isNestedEntry(value) {
            if (typeof (value) !== "object")
                return false;
            return value["value"] === undefined;
        }
    }];

    return directive;
};

module.exports = me;
