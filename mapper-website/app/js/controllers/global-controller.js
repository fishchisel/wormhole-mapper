'use strict';

var userService = require('../services/user-service'),
    principal = require('local/repositories/firebase-auth'),
    themeService = require('../services/theme-service.js');

var ctrl = function ($scope, $state, $timeout) {
    $scope.siteConfig = siteConfig;


	principal.identity().then(function (x) {
	    setUser(x);
	});
	principal.principalChanged(function (identity) {
	    setUser(identity);
	});

	$scope.setBodyClass = function(className) {
	    $scope.bodyClass = className;
	}

	$scope.is = function (name) {
		return $state.includes(name);
	}

	$scope.logout = function () {
		principal.logout();
		$state.go('index');
	}

	$scope.themes = {};
	themeService.getAllThemes().sort().forEach(function(x) {
	    $scope.themes[x] = x.charAt(0).toUpperCase() + x.slice(1);
	});
	delete $scope.themes.default;

	$scope.setTheme = function (themeName) {
	    themeService.saveTheme(themeName);
	}
	$scope.hasTheme = function (themeName) {
	    return themeName === themeService.getCurrentTheme();
	}

	function setUser(identity) {
	    if (identity) {
	        var roles = {};
	        identity.roles.forEach(function (role) {
	            roles[role] = true;
	        });

	        userService.getCurrentUser().then(function (user) {
	            $scope.safeApply(function () {
	                $scope.user = user;
	                $scope.userRoles = roles;
	            });
	        });
	    }
	    else {
	        $scope.user = null;
	        $scope.roles = {};
	    }
	}
};

module.exports = ctrl;