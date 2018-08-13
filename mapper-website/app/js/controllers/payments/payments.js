'use strict';

var userRep = require('local/repositories/user'),
    leaderboardRep = require('local/repositories/leaderboard'),
    metadataRep = require('local/repositories/metadata');

var q = require('q'),
    moment = require('moment'),
    numeral = require('numeral');

function format(val) {
    return numeral(val).format('0,0') + " ISK";
}

var Details = function (user, leaderboard, consts) {
    this.data = user;
    this.leaderboard = leaderboard;

    this.name = user.name;
    this.alliance = user.alliance ? user.alliance : "-";

    this.picUrl = user.getPortraitUrl(32);

    var total = leaderboard.getTotal();
    var paid = leaderboard.getFindsPaidFor();

    this.consts = consts;
    this.wormholesAdded = total.wormholesAdded - paid.wormholesAdded;
    this.wormholesCompleted = total.wormholesCompleted - paid.wormholesCompleted;
}
Details.prototype.getTotalPaid = function () {
    return this.leaderboard.totalPaidAmount;
}
Details.prototype.getTotalPaidPretty = function () {
    return format(this.getTotalPaid());
}
Details.prototype.getAmountDue = function () {
    var addedVal = this.wormholesAdded * this.consts.wormholesAdded;
    var completedVal = this.wormholesCompleted * this.consts.wormholesCompleted;
    return addedVal + completedVal;
}
Details.prototype.getAmountDuePretty = function () {
    return format(this.getAmountDue());
}

var reconciledHolder = {};
Details.prototype.getReconciled = function () {
    return reconciledHolder[this.data.id];
}
Details.prototype.toggleReconcile = function () {
    reconciledHolder[this.data.id] = !reconciledHolder[this.data.id];
}

var sortingFunctions = {
    name: function (a, b) {
        return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
    },
    alliance: function (a, b) {
        if (a.alliance === b.alliance) return sortingFunctions.name(a,b);
        return a.alliance.toLowerCase() < b.alliance.toLowerCase() ? -1 : 1;
    },
    totalPaid: function (a, b) {
        if (a.getTotalPaid() === b.getTotalPaid()) return sortingFunctions.name(a, b);
        return a.getTotalPaid() < b.getTotalPaid() ? 1 : -1;
    },
    amountDue: function (a, b) {
        if (a.getAmountDue() === b.getAmountDue()) return sortingFunctions.name(a, b);
        return a.getAmountDue() < b.getAmountDue() ? 1 : -1;
    },
    added: function (a, b) {
        if (a.wormholesAdded === b.wormholesAdded) return sortingFunctions.name(a, b);
        return a.wormholesAdded < b.wormholesAdded ? 1 : -1;
    },
    completed: function (a, b) {
        if (a.wormholesCompleted === b.wormholesCompleted) return sortingFunctions.name(a, b);
        return a.wormholesCompleted < b.wormholesCompleted ? 1 : -1;
    }
};

var filterFunctions = {
    noncontributors: function (a) {
        return a.getTotalPaid() > 0 || a.wormholesAdded > 0 || a.wormholesCompleted > 0;
    }
};

module.exports = function ($scope, $state) {
    q.all([userRep.initialize(), leaderboardRep.initialize(), metadataRep.initialize()])
        .then(display);

    var sortFunc = sortingFunctions['name'];

    var consts = {
        wormholesAdded: 0,
        wormholesCompleted: 0,
        wormholesAddedPretty: function () {
            return format(this.wormholesAdded);
        },
        wormholesCompletedPretty: function () {
            return format(this.wormholesCompleted);
        }
    }

    function display() {

        $scope.safeApply(function () {
            $scope.hasLoaded = true;

            consts.wormholesAdded = metadataRep.get("iskPerWormholeAdded");
            consts.wormholesCompleted = metadataRep.get("iskPerWormholeCompleted");

            $scope.wormholeValues = consts;
            
            var totals = {
                totalPaid: 0,
                wormholesAdded: 0,
                wormholesCompleted: 0
            }
            var items = userRep.getArray().map(function (usr) {
                var lb = leaderboardRep.get(usr.id);
                var dtls = new Details(usr, lb, consts);

                totals.totalPaid += dtls.getTotalPaid();
                totals.wormholesAdded += dtls.wormholesAdded;
                totals.wormholesCompleted += dtls.wormholesCompleted;

                return dtls;
            });

            items = items.sort(sortFunc);
            items = items.filter(filterFunctions.noncontributors);

            $scope.items = items;
            $scope.totals = {
                totalPaid: format(totals.totalPaid),
                wormholesAdded: totals.wormholesAdded,
                wormholesCompleted: totals.wormholesCompleted,
            };
            Object.defineProperty($scope.totals, "amountDue",
                {
                    get: function () {
                        var num = $scope.items.reduce(function (prev, curr) {
                            return prev + curr.getAmountDue();
                        }, 0);
                        return format(num);
                    }
                });
        });
    };

    $scope.sort = function (type) {
        var newFunc = sortingFunctions[type];
        if (newFunc === sortFunc) {
            var oldFunc = sortFunc
            sortFunc = function (a, b) { return oldFunc(a, b) * -1; };
        }
        else {
            sortFunc = newFunc;
        }
        display();
    }

    $scope.getTotalReconciled = function () {
        var items = $scope.items;
        if (!items) return false;
        var res = items.reduce(function (prev, curr) {
            if (!curr.getReconciled())
                return prev;
            return prev + curr.getAmountDue();
        }, 0);
        return format(res);
    }

    $scope.canSaveReconciliations = function () {
        var items = $scope.items;
        if (!items) return false;
        return items.some(function (x) {
            return x.getReconciled();
        });
    }

    $scope.saveReconciliations = function () {
        var items = $scope.items;
        items = items.filter(function (x) {
            return x.getReconciled();
        });

        var msg = "Reconcile " + items.length + " payments? This is not reversible.";
        var state = confirm(msg);

        if (state) {
            leaderboardRep.supressChanged(true);
            for (var i = 0; i < items.length; i++) {
                reconcile(items[i]);
            }
            leaderboardRep.supressChanged(false);
            reconciledHolder = {};
            display();
        }
    }

    $scope.$watch('wormholeValues', function (newVal, oldVal) {
        if (newVal == undefined) return;

        newVal.wormholesAdded = Number(newVal.wormholesAdded);
        newVal.wormholesCompleted = Number(newVal.wormholesCompleted);

        metadataRep.set('iskPerWormholeAdded', newVal.wormholesAdded);
        metadataRep.set('iskPerWormholeCompleted', newVal.wormholesCompleted);
    },true);

    $scope.$on('$destroy', function () {
        metadataRep.changedRemoveHandler(display);
    });

    function reconcile(userDetails) {
        var user = userDetails.data;
        var leaderboard = userDetails.leaderboard;
        
        var paidOut = userDetails.getAmountDue();
        var curr = leaderboard.totalPaidAmount;
        var newPaid = paidOut + curr;
        leaderboard.totalPaidAmount = newPaid;
        leaderboard.setFindsPaidFor(leaderboard.getTotal());

        leaderboardRep.update(leaderboard);
    }

};
