'use strict';
import {FakeAPIService} from "../../services/FakeAPIService";
import {AuthenticationService} from "../../../../node_modules/gl-ionic-oauth-client/package/src/AuthenticationService";

export class MainController {

    /** @ngInject */
    constructor(private $scope: any,
                private $rootScope: any,
                private fakeAPIService:FakeAPIService,
                private authenticationService:AuthenticationService,
                private ionic: any,
                private $timeout:angular.ITimeoutService,
                private $ionicPopup: any,
                private $state: angular.ui.IStateService) {

        // TODO: change these fields to connect to your oAuth server
        var clientId = "clientId";
        var oauthUrl = "https://your-oauth-server/Login";

        this.authenticationService.init(clientId, oauthUrl);

        this.$scope.$on('$ionicView.beforeEnter', () => {
            this.launchOAuth();
        });

        this.$rootScope.$on(AuthenticationService.AuthenticationOAuthError, () => {
            var myPopup = this.$ionicPopup.show({
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

    launchOAuth () {
        var apiOAuthFunction = this.fakeAPIService.connect.bind(this.fakeAPIService);
        var oauthRedirectState = 'main';
        var successRedirectUrlAndState = {
            state: 'success',
            url: 'success'
        };
        this.authenticationService.handleOAuth(apiOAuthFunction, successRedirectUrlAndState, oauthRedirectState);
    }
}
