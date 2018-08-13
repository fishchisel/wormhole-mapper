var userService = require('../../services/user-service');

module.exports = function ($scope, $state, $timeout) {

    $scope.loginContacts = siteConfig.loginContacts;

    var code = $state.params.code;

    if (!code && !$state.params.dev)
        $state.go('login');

    var url = siteConfig.serverLoginUrl;
    var outData = {
        type: siteConfig.type,
        authCode: code
    }

    if (siteConfig.devCodeO && $state.params.dev === "o") {
        login({ token: siteConfig.devCodeO });
        return;
    }
    else if (siteConfig.devCodeP && $state.params.dev === "p") {
        login({ token: siteConfig.devCodeP });
        return;
    }


    // $http wont work with CORS here for some reason
    $.post(url, outData).done(function (res) {
        login(res);
    }).fail(function (res) {
        $timeout(function () {
            $scope.failed = true;
            if (res.responseText) {
                $scope.statusText = res.responseText;
            }
            else {
                $scope.statusText = "Login request failed in unknown manner. Check Noscript.";
            }
        });
    });

    $scope.failed = false;
    $scope.statusText = "Querying login server...";

    function login(response) {
        var charInfo = response.characterInfo;
        var token = response.token;

        $scope.statusText = "Authenticating to database...";

        userService.login(token, charInfo).then(function () {
            $scope.statusText = "Success!";
            $state.go('system-list');
        }).fail(function (msg) {
            $scope.safeApply(function () {
                $scope.statusText = msg;
                $scope.failed = true;
            });
        }).done();
    };
};