module.exports = function ($scope, $state) {

    var redirectUri = siteConfig.redirectUri.replace('#', '%23');
    var clientId = siteConfig.clientId
    var state = ''

    var ssoUrl = siteConfig.ssoHost +
        '/oauth/authorize/?response_type=code&redirect_uri={0}&client_id={1}&scope=&state={2}'
        .format(redirectUri, clientId, state);

    $scope.ssoUrl = ssoUrl;
    $scope.returnToState = $state.params.retName;

};