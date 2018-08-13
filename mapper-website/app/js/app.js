'use strict';

var q = require('q'),
    request = require('request');

var systemRepository = require('local/repositories/system'),
    wormholeClassRepository = require('local/repositories/wormhole-class'),
    bridgeRepository = require('local/repositories/bridge'),
    scannedSystemRepository = require('local/repositories/scanned-system'),
    signatureRepository = require('local/repositories/signature'),
    wormholeRepository = require('local/repositories/wormhole'),
    metadataRepository = require('local/repositories/metadata')

var principal = require('local/repositories/firebase-auth');
var userService = require('./services/user-service.js');
var userRepository = require('local/repositories/user');


//-------------------------------------------------------------------------------------------------
// Import various services, shims, controllers etc into the global namespace, or angular.
require('./helpers');
require('./lib-config');

var repositories = require('local/repositories');
repositories.setFirebaseUrl(siteConfig.firebaseUrl);

// stops the maintenance server from turning itself off...
request(siteConfig.maintenanceServerUrl, function () { });

require('./extensions/signature-repository');
require('./extensions/wormhole-repository');

var angular = require('angular');

var app = angular.module('wormholeMapper', [
	'ui.router',		// nested routing module
	'ui.bootstrap',		// directives for bootstrap
]);

app.constant('fbRef', new Firebase(siteConfig.firebaseUrl))

require('./controllers');
require('./angular-factories');
require('./directives');

//-------------------------------------------------------------------------------------------------
// Route setup

var staticDataResolve = {
    staticData: function () {
        var a = systemRepository.initialize();
        var b = wormholeClassRepository.initialize();
        return q.all([a,b])
	},
	authorize: ['authorizationService',
	  function (authorization) {
	  	return authorization.authorize();
	  }
	],
	homeSystem: function () {
	    return userService.getCurrentUser().then(function (usr) {
	        if (!usr) return true;
	        return metadataRepository.initialize().then(function () {
	            var homeSystemId = metadataRepository.get('homeSystemId');
	            siteConfig.homeSystem = systemRepository.getSystem(homeSystemId);
	        });
	    });
	}
}

var usr = { roles: ['user'] };
var admin = { roles: ['admin'] };

app.config(['$stateProvider','$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    $stateProvider

        //public
		.state('index', {
		    url: '/',
		    templateUrl: 'views/front-page.html',
		    resolve: staticDataResolve
		})
        .state('login', {
            url: '/login',
            controller: 'LoginController',
            params: { ret: null },
            templateUrl: 'views/login.html',
            resolve: staticDataResolve
        })
		.state('login-return', {
		    url: '/login-return?code&dev',
		    controller: 'LoginReturnController',
		    templateUrl: 'views/login-return.html',
		    resolve: staticDataResolve

		})
		.state('accessdenied', {
		    template: "<div class='panel panel-default'><h2>Access Denied</h2></div>",
		    resolve: staticDataResolve,
		})

        //user
		.state('system-list', {
		    url: '/system-list',
		    controller: 'SystemListController',
		    templateUrl: 'views/system-list.html',
		    resolve: staticDataResolve,
		    data: usr
		})
		.state('system-list.details', {
		    url: '/:systemName',
		    controller: 'SystemDetailsController',
		    templateUrl: 'views/system-list.details.html',
		})
		.state('wormhole-list', {
		    url: '/wormhole-list',
		    controller: 'WormholeListController',
		    templateUrl: 'views/wormhole-list.html',
		    resolve: staticDataResolve,
		    data: usr
		})
		.state('wormhole-list.edit', {
		    templateUrl: 'views/wormhole-list.edit.html',
		    params: { wormhole: null },
		})
		.state('bridge-list', {
		    url: '/bridge-list',
		    controller: 'BridgeListController',
		    templateUrl: 'views/bridge-list.html',
		    resolve: staticDataResolve,
		    data: usr
		})
		.state('bridge-list.edit', {
		    templateUrl: 'views/bridge-list.edit.html',
		    controller: 'BridgeEditController',
		    params: { bridge: null },
		})
		.state('bridge-list.in-range', {
		    templateUrl: 'views/bridge-list.in-range.html',
		    params: { bridge: {} },
		    controller: 'BridgeSystemsInRangeController'
		})
		.state('route-finder', {
		    url: '/route-finder',
		    controller: 'RouteFinderSearchController',
		    templateUrl: 'views/route-finder.html',
		    reloadOnSearch: false,
		    resolve: staticDataResolve,
		    data: usr
		})
		.state('route-finder.find', {
		    controller: 'RouteFinderController',
		    templateUrl: 'views/route-finder.find.html',
		    params: {
		        start: {}, end: {},
		        hi: {}, lo: {}, nl: {}, ws: {}, br: {}, st: {}, wh: {}, mbd: {}, mr: {}
		    }
		})
        .state('map', {
            url:'/map',
            controller: 'MapController',
            templateUrl: 'views/map.html',
            resolve: staticDataResolve,
            data:usr
        })
        .state('map2', {
            url: '/map2',
            controller: 'Map2Controller',
            templateUrl: 'views/map2.html',
            resolve: staticDataResolve,
            data: usr
        })

        .state('users', {
            url: '/users',
            controller: 'UserListController',
            templateUrl: 'views/user-list.html',
            data: usr
        })
        .state('user-details', {
            url: '/users/:user',
            controller: 'UserDetailsController',
            templateUrl: 'views/user-details.html',
            data: usr
        })
		.state('leaderboard', {
		    url: '/leaderboard',
		    controller: 'LeaderboardController',
		    templateUrl: 'views/leaderboard.html',
		    resolve: staticDataResolve,
		    data: usr
		})

        //admin
        .state('access-control', {
            url: '/access-control',
            controller: 'AccessControlController',
            templateUrl: 'views/access-control.html',
            resolve: staticDataResolve,
            data: admin
        })
        .state('payments', {
            url: '/payments',
            controller: 'PaymentsController',
            templateUrl: 'views/payments.html',
            resolve: staticDataResolve,
            data: admin
        })
        .state('search-log', {
            url: '/search-log',
            controller: 'RouteLogController',
            templateUrl: 'views/route-log.html',
            resolve: staticDataResolve,
            data: admin
        })
        .state('login-log', {
            url: '/login-log',
            controller: 'LoginLogController',
            templateUrl: 'views/login-log.html',
            resolve: staticDataResolve,
            data: admin
        })

	$urlRouterProvider
		.otherwise('/');
}])

//-----------------------------------------------------------------------------------------
// Various application setup stuff

app.config([
  '$provide', function ($provide) {
      // creates the safeApply method for using instead of $timeout
      return $provide.decorator('$rootScope', [
        '$delegate', function($delegate) {
            $delegate.safeApply = function(fn) {
                var phase = $delegate.$$phase;
                if (phase === "$apply" || phase === "$digest") {
                    if (fn && typeof fn === 'function') {
                        fn();
                    }
                } else {
                    $delegate.$apply(fn);
                }
            };
            return $delegate;
        }
      ]);
  }
]);

// some initialization code
app.run(function () {

    staticDataResolve.staticData().then(function () {
        siteConfig.homeSystem = systemRepository.getSystemsArray[0];
        bridgeRepository.initialize();
        wormholeRepository.initialize();
        scannedSystemRepository.initialize();
        signatureRepository.initialize();
    });

    var themeService = require('./services/theme-service.js');
    themeService.loadTheme();
});

// user login code

app.run(['$rootScope', '$state', '$stateParams', 'authorizationService',
    function ($rootScope, $state, $stateParams, authorization) {

        $rootScope.$on('$stateChangeStart', function (event, toState, toStateParams) {
            // track the state the user wants to go to; authorization service needs this

            $rootScope.toState = toState;
            $rootScope.toStateParams = toStateParams;
            // if the principal is resolved, do an authorization check immediately. otherwise,
            // it'll be done when the state is resolved.
            if (principal.isIdentityResolved())
                authorization.authorize();

            // log user activity
            userService.getCurrentUser().then(function (user) {
                if (!user) return;

                user.lastActivity = Date.now()
                userRepository.update(user);
            });

        });
    }
])