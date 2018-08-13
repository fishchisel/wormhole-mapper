'use strict';

var app = require('angular').module('wormholeMapper');


app.controller('GlobalController',
    ['$scope', '$state', '$timeout',
     require('./global-controller.js')]);


app.controller('BridgeListController',
    ['$scope', '$state',
     require('./bridge-list/bridge-list.js')]);

app.controller('BridgeEditController',
    ['$scope', '$stateParams',  
     require('./bridge-list/bridge-list.edit.js')]);

app.controller('BridgeSystemsInRangeController',
    ['$scope', '$stateParams',  
     require('./bridge-list/bridge-list.in-range.js')]);


app.controller('LoginController',
    ['$scope', '$state',
     require('./login/login.js')]);

app.controller('LoginReturnController',
    ['$scope', '$state', '$timeout',
     require('./login/login-return.js')]);

app.controller('MapController',
    ['$scope','$state',
     require('./map')]);
app.controller('Map2Controller',
    ['$scope','$state',
     require('./map/map2.js')]);

app.controller('RouteFinderSearchController',
    ['$scope', '$state', '$timeout',
     require('./route-finder/route-finder.search.js')]);

app.controller('RouteFinderController',
    ['$scope', '$state', '$stateParams', '$timeout',
     require('./route-finder/route-finder.display.js')]);


app.controller('SystemListController',
    ['$scope', '$state', '$timeout', '$q',
     require('./system-list/system-list.js')]);

app.controller('SystemDetailsController',
    ['$scope', '$state', '$stateParams', '$q',
     require('./system-list/system-list.details.js')]);


app.controller('WormholeListController',
    ['$scope', '$state', '$timeout',
     require('./wormhole-list/wormhole-list.js')]);

app.controller('WormholeEditController',
    ['$scope', '$stateParams', 
     require('./wormhole-list/wormhole-list.edit.js')]);


app.controller('UserListController',
    ['$scope', '$state',
     require('./user-list')]);

app.controller('UserDetailsController',
    ['$scope', '$state', '$stateParams',
     require('./user-details')]);

app.controller('LeaderboardController',
    ['$scope', '$state',
     require('./leaderboard')]);


app.controller('AccessControlController',
    ['$scope', '$state',
     require('./access-control')]);
app.controller('PaymentsController',
    ['$scope', '$state',
     require('./payments')]);
app.controller('RouteLogController',
    ['$scope', require('./route-log')]);
app.controller('LoginLogController',
    ['$scope', require('./login-log')]);




app.controller('ScratchController',
    ['$scope', '$state',
     require('./scratch')]);
