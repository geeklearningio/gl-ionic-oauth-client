'use strict';
var AuthenticationService_1 = require("../../../../node_modules/gl-ionic-oauth-client/package/src/AuthenticationService");
var MainController = (function () {
    /** @ngInject */
    function MainController($scope, $rootScope, fakeAPIService, authenticationService, ionic, $timeout, $ionicPopup, $state) {
        var _this = this;
        this.$scope = $scope;
        this.$rootScope = $rootScope;
        this.fakeAPIService = fakeAPIService;
        this.authenticationService = authenticationService;
        this.ionic = ionic;
        this.$timeout = $timeout;
        this.$ionicPopup = $ionicPopup;
        this.$state = $state;
        // TODO: change these fields to connect to your oAuth server
        var clientId = "clientId";
        var oauthUrl = "https://your-oauth-server/Login";
        this.authenticationService.init(clientId, oauthUrl);
        this.$scope.$on('$ionicView.beforeEnter', function () {
            _this.launchOAuth();
        });
        this.$rootScope.$on(AuthenticationService_1.AuthenticationService.AuthenticationOAuthError, function () {
            var myPopup = _this.$ionicPopup.show({
                template: 'Nous n\'avons pas pu vous connecter. Veuillez réessayer.',
                title: 'Problème de connexion',
                buttons: [
                    {
                        text: 'Ok',
                        type: 'button-positive'
                    }
                ]
            });
        });
    }
    MainController.prototype.launchOAuth = function () {
        var apiOAuthFunction = this.fakeAPIService.connect.bind(this.fakeAPIService);
        var oauthRedirectState = 'main';
        var successRedirectUrlAndState = {
            state: 'success',
            url: 'success'
        };
        this.authenticationService.handleOAuth(apiOAuthFunction, successRedirectUrlAndState, oauthRedirectState);
    };
    return MainController;
}());
exports.MainController = MainController;
