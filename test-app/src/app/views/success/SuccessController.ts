'use strict';
import {FakeAPIService} from "../../services/FakeAPIService";
import {AuthenticationService} from "../../../../node_modules/gl-ionic-oauth-client/src/AuthenticationService";

export class SuccessController {
    newAccessToken: string;

    /** @ngInject */
    constructor(private fakeAPIService: FakeAPIService, private authenticationService: AuthenticationService) {
    }

    refreshToken() {
        var apiRefreshTokenFunction = this.fakeAPIService.refreshToken.bind(this.fakeAPIService);
        this.authenticationService.refreshTokenOrLogout(apiRefreshTokenFunction, 'main').then((result) => {
            this.newAccessToken = result.data.content.accessToken;
        });
    }

    logout () {
        this.authenticationService.logout('main');
    }


}
