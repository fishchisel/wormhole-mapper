'use strict';
// From: http://stackoverflow.com/questions/22537311/angular-ui-router-login-authentication

var principal = require('local/repositories/firebase-auth');

var authorization = function ($rootScope, $state) {

    var me = {};

    me.authorize = function () {

        var promise = principal.identity()
            .then(function () {
                var isAuthenticated = principal.isAuthenticated();


                if ($rootScope.toState.data && $rootScope.toState.data.roles
                    && $rootScope.toState.data.roles.length > 0
                    && !principal.isInAnyRole($rootScope.toState.data.roles)) {

                    if (isAuthenticated)
                        $state.go('accessdenied');
                    else {
                        // user is not authenticated. stow the state they wanted before you
                        // send them to the signin state, so you can return them when you're done
                        $rootScope.returnToState = $rootScope.toState;
                        $rootScope.returnToStateParams = $rootScope.toStateParams;

                        // now, send them to the signin state so they can log in
                        $state.go('login', { retName: $rootScope.returnToState.name });
                    }
                }
            });

        return promise;
    }

    return me;
}

module.exports = authorization;


