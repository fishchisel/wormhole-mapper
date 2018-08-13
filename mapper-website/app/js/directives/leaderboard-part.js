'use strict';

var me = function () {

    var directive = {

        restrict: "E",
        templateUrl: 'views/directives/leaderboard-part.html',
        scope: {
            inData: '=leaderboardStats',
            title: '@title',
            showTotal: '@showTotal',
            //showRemainder: '@showRemainder',
            expandable: '@expandable',
            numRecords: '@maxRecords'
        },
        controller: ['$scope', '$state', function ($scope, $state) {
            var allData, topData, remainder;

            if (!$scope.numRecords) $scope.numRecords = 10;
            if ($scope.showTotal === undefined) $scope.showTotal = true;

            $scope.$watch('inData', function () {
                if (!$scope.inData) return;

                $scope.hasLoaded = true;

                $scope.total = 0;
                $scope.remainder = 0;

                var data = $scope.inData.sort(function (a, b) {
                    return a.score < b.score ? 1 : -1;
                }).map(function (x) {
                    $scope.total += x.score;
                    return {
                        picUrl: x.user.getPortraitUrl(32),
                        name: x.user.name,
                        score: x.score
                    }
                });

                allData = data;
                topData = data.slice(0, $scope.numRecords);
                remainder = data.slice($scope.numRecords).reduce(function (prev, curr) {
                    return prev + curr.score;
                }, 0);

                $scope.isExpanded = false;
                $scope.data = topData;
                $scope.remainder = remainder;
            });

            $scope.toggleShowAll = function () {
                if ($scope.isExpanded) {
                    $scope.isExpanded = false;
                    $scope.data = topData;
                    $scope.remainder = remainder;
                }
                else {
                    $scope.isExpanded = true;
                    $scope.data = allData;
                    $scope.remainder = 0;
                }
            }

        }]
    }
    
    return directive;
};

module.exports = me;