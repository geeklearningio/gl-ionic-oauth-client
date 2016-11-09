import {IKeyValueStorageService, KeyValueStorageService} from "./KeyValueStorageService";
export interface IUrlAndState {
    url:string,
    state:string
}

export class AuthenticationService {
    public static AuthenticationAccessTokenStorageKey:string = "authentication.service.accessToken";
    public static AuthenticationRefreshTokenStorageKey:string = "authentication.service.refreshToken";

    public static AuthenticationOAuthError:string = 'authentication.service.oauthError';
    public static AuthenticationOAuthSuccess:string = 'authentication.service.oauthSuccess';

    private cordovaInAppBrowserLoadstartUnsuscribe:any = null;
    private cordovaInAppBrowserExitUnsuscribe:any = null;
    private isAuthenticating:boolean;

    private apiOAuthFunction:Function;
    private oAuthRedirectState:string;
    private successRedirectUrlAndState:IUrlAndState;

    private clientId:string;
    private baseAuthUrl:string;
    private oAuthState:string;

    public isLoading:boolean;

    private authenticationCodeDidNotWork:boolean;

    private currentAccessToken:string;

    /* @ngInject */
    constructor(private $rootScope:angular.IRootScopeService,
                private $q:angular.IQService,
                private ionic:any,
                private $cordovaInAppBrowser:any,
                private $state:angular.ui.IStateService,
                private $timeout:angular.ITimeoutService,
                private $window:any,
                private keyValueStorageService:KeyValueStorageService) {
        this.getAndSetCurrentAccessToken();
    }

    /**
     * Init the Service
     * @param clientId: the app client ID
     * @param baseAuthUrl: the Login function url of your OAuth server
     */
    public init(clientId:string, baseAuthUrl:string) {
        this.clientId = clientId;
        this.baseAuthUrl = baseAuthUrl;
        this.generateState();
    }

    /**
     * check if user is already logged in
     * @returns {IPromise<boolean>}
     */
    public isAuthenticated():angular.IPromise<boolean> {
        var deferred:ng.IDeferred<any> = this.$q.defer();

        if (this.currentAccessToken) {
            deferred.resolve(true);
        } else {
            this.getAndSetCurrentAccessToken()
                .then((accessToken:string) => {
                    if (accessToken) {
                        deferred.resolve(true);
                    } else {
                        deferred.resolve(false);
                    }
                });
        }
        return deferred.promise;
    }

    /**
     * get current access token from storage and save it for later
     * @returns {IPromise<any>}
     */
    private getAndSetCurrentAccessToken(): angular.IPromise<string> {
        var deferred:ng.IDeferred<any> = this.$q.defer();
        this.readStorageAccessToken()
            .then((accessToken:string) => {
                if (accessToken) {
                    this.currentAccessToken = accessToken;
                    deferred.resolve(accessToken);
                } else {
                    deferred.resolve(null);
                }
            });
        return deferred.promise;
    }

    /**
     * Handle the OAuth of your application
     * @param apiOAuthFunction: Your API function that will give you the accessToken by getting the accessCode.
     * @param successRedirectUrlAndState: the url and state of the page you want to go to when the Authentication has succeeded. (The url is needed to work in the web version of your app).
     * @param oAuthRedirectState: the state to redirect to with the accessCode as a Query param.
     */
    public handleOAuth(apiOAuthFunction:Function, successRedirectUrlAndState:IUrlAndState, oAuthRedirectState:string = 'login') {
        this.apiOAuthFunction = apiOAuthFunction;
        this.handleLogin(successRedirectUrlAndState)
            .then((isAuthenticated:boolean) => {
                if (!isAuthenticated) {
                    this.authenticationCodeDidNotWork = false;
                    if (this.ionic.Platform.isReady || !this.ionic.Platform.isWebView()) {
                        this.launchOAuth(oAuthRedirectState);
                    } else {
                        // if ionic is not ready, wait for 1 second before launching the In App browser or it won't launch on iOS...
                        this.ionic.Platform.ready(() => {
                            this.$timeout(() => {
                                this.launchOAuth(oAuthRedirectState);
                            }, 1000);
                        });
                    }
                }
            });
    }

    private handleLogin(successRedirectUrlAndState:IUrlAndState):angular.IPromise<boolean> {
        var deferred:ng.IDeferred<any> = this.$q.defer();

        if (this.handleAuthentificationCode(successRedirectUrlAndState)) {
            deferred.resolve(true);
        } else {
            this.isAuthenticated()
                .then((isAuthenticated:boolean) => {
                    if (isAuthenticated) {
                        this.$state.go(successRedirectUrlAndState.state);
                    }
                    deferred.resolve(isAuthenticated);
                });
        }
        return deferred.promise;
    }

    private launchOAuth(oAuthRedirectState:string = 'login') {
        this.isLoading = true;
        this.oAuthRedirectState = oAuthRedirectState;

        var redirectUri = document.URL + this.oAuthRedirectState;
        if (this.ionic.Platform.isWebView()) {
            redirectUri = 'http://localhost/#/' + this.oAuthRedirectState;
        }

        var authUrl:string = this.baseAuthUrl + '?protocol=oauth2&scope=' +
            '&client_id=' + this.clientId +
            '&state=' + this.oAuthState +
            '&response_type=code&redirect_uri=' + encodeURIComponent(redirectUri);
        this.launchExternalLink(authUrl, '_blank');
    }

    /**
     * Configure your requests headers with the accessToken
     * @param httpRequestParams
     * @returns {any}
     */
    public configureRequest(httpRequestParams:any):any {
        httpRequestParams.headers['Authorization'] = 'Bearer ' + this.currentAccessToken;
        if (!this.currentAccessToken) {
            console.error('Error: Trying to call an api function before the access token has been retrieved');
        }
        return httpRequestParams;
    }

    /**
     * Disconnect the user from your app
     * @param logoutState: the state to go to after the logout.
     */
    public logout(logoutState:string = 'login') {
        this.currentAccessToken = null;
        this.removeStorageAccessToken();
        this.removeStorageRefreshToken();
        this.$state.go(logoutState);
    }

    /**
     * Refresh the accessToken using the refreshToken or logout if it fails doing so.
     * @param apiRefreshTokenFunction: the refreshToken function of your API.
     * @param logoutState: the state to got to after the logout.
     * @returns {IPromise<any>}
     */
    public refreshTokenOrLogout(apiRefreshTokenFunction:Function, logoutState:string = 'login'):angular.IPromise<any> {
        var deferred:ng.IDeferred<any> = this.$q.defer();
        this.isLoading = true;

        this.readStorageRefreshToken()
            .then((refreshToken:string) => {
                if (refreshToken) {
                    apiRefreshTokenFunction({
                        authRequest: {
                            refreshToken: refreshToken
                        }
                    })
                        .then((result) => {
                            this.$rootScope.$broadcast(AuthenticationService.AuthenticationOAuthSuccess);
                            this.writeStorageAccessToken(result.data.content.accessToken);
                            this.isLoading = false;
                            deferred.resolve(result);
                        }, (error) => {
                            this.isLoading = false;
                            this.logout();
                            deferred.reject(error);
                        });
                } else {
                    this.isLoading = false;
                    this.logout();
                    deferred.reject('no refresh token found');
                }
            });
        return deferred.promise;
    }

    private generateState() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 15; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        this.oAuthState = text;
    }

    private handleAuthentificationCode(successRedirectUrlAndState:IUrlAndState) {
        if (this.authenticationCodeDidNotWork) {
            return;
        }
        this.successRedirectUrlAndState = successRedirectUrlAndState;
        this.isLoading = true;
        var code:string = this.getUrlParameter('code');
        if (code) {
            this.oauthLogin(code);
            return true;
        } else {
            this.isLoading = false;
        }
        return false;
    }

    private getUrlParameter(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    private oAuth(accessCode:string):angular.IPromise<any> {
        var deferred:ng.IDeferred<any> = this.$q.defer();
        this.apiOAuthFunction({
            authRequest: {
                redirectUri: document.URL + 'oauthresponse',
                authorizationCode: accessCode
            }
        })
            .then((result) => {
                this.writeStorageAccessToken(result.data.content.accessToken);
                this.writeStorageRefreshToken(result.data.content.refreshToken);
                deferred.resolve(result);
            }, (error) => {
                deferred.reject(error);
            });
        return deferred.promise;
    }

    public writeStorageAccessToken(authToken:string):void {
        this.keyValueStorageService.set(AuthenticationService.AuthenticationAccessTokenStorageKey, authToken);
        this.currentAccessToken = authToken;
    }

    private readStorageAccessToken():angular.IPromise<string> {
        var deferred:ng.IDeferred<any> = this.$q.defer();
        this.keyValueStorageService.get(AuthenticationService.AuthenticationAccessTokenStorageKey)
            .then((value:string) => {
                deferred.resolve(value);
            }, () => {
                deferred.resolve(null);
            });
        return deferred.promise;
    }

    private removeStorageAccessToken() {
        this.keyValueStorageService.remove(AuthenticationService.AuthenticationAccessTokenStorageKey);
    }

    private writeStorageRefreshToken(refreshToken:string):void {
        this.keyValueStorageService.set(AuthenticationService.AuthenticationRefreshTokenStorageKey, refreshToken);
    }

    private readStorageRefreshToken():angular.IPromise<string> {
        var deferred:ng.IDeferred<any> = this.$q.defer();
        this.keyValueStorageService.get(AuthenticationService.AuthenticationRefreshTokenStorageKey)
            .then((value:string) => {
                deferred.resolve(value);
            });
        return deferred.promise;
    }

    private removeStorageRefreshToken() {
        this.keyValueStorageService.remove(AuthenticationService.AuthenticationRefreshTokenStorageKey);
    }

    private launchExternalLink(url:string, target:string):void {
        var options:{ [key:string]:any } = null;
        if (!this.ionic.Platform.isWebView()) {
            this.$window.location.href = url;
        } else {
            options = {
                location: 'no',
                toolbar: 'yes',
                closebuttoncaption: 'Fermer'
            };
            this.$cordovaInAppBrowser.open(url, target, options);
            if (this.cordovaInAppBrowserLoadstartUnsuscribe === null) {
                // general case (IOS & Android)
                this.cordovaInAppBrowserLoadstartUnsuscribe = this.$rootScope.$on(
                    '$cordovaInAppBrowser:loadstart', (e:ng.IAngularEvent, event:any):void => {
                        var url:string = event.url;
                        var codeReg:RegExpExecArray = /\?code=([^&#]+)/.exec(url);
                        var errorReg:RegExpExecArray = /\?error=([^&#]+)/.exec(url);
                        var called:boolean = false;

                        if (!called && codeReg) {
                            called = true;
                            this.$cordovaInAppBrowser.close();
                            this.isAuthenticating = true;
                            this.oauthLogin(codeReg[1], false);
                        } else if (errorReg) {
                            onFailure(errorReg[1]);
                        }
                    });

                // user went back
                this.cordovaInAppBrowserExitUnsuscribe = this.$rootScope.$on(
                    '$cordovaInAppBrowser:exit', (e:ng.IAngularEvent, event:any):void => {
                        if (!this.isAuthenticating) {
                            this.isLoading = false;
                        }
                    });

                var onFailure = (reason:string) => {
                    this.isLoading = false;
                    this.$cordovaInAppBrowser.close();
                    this.$rootScope.$broadcast(AuthenticationService.AuthenticationOAuthError);
                };
            }
        }
    }

    private oauthLogin(code:string, redirect:boolean = true) {
        this.oAuth(code)
            .then((result) => {
                this.$rootScope.$broadcast(AuthenticationService.AuthenticationOAuthSuccess);
                this.isAuthenticating = false;
                this.isLoading = false;
                var tempArr = document.URL.split('/?');
                if (redirect) {
                    this.$window.location.href = tempArr[0] + '/#/' + this.successRedirectUrlAndState.url;
                } else {
                    this.$state.go(this.successRedirectUrlAndState.state);
                }
            }, (error) => {
                // if the authentication code didn't work, do not try to use it again
                this.authenticationCodeDidNotWork = true;
                this.$rootScope.$broadcast(AuthenticationService.AuthenticationOAuthError);
                this.isLoading = false;
            });
    }
}

declare var exports:any;

exports = angular.module("gl-ionic-oauth-client", [])
    .service("authenticationService", AuthenticationService)
    .service("keyValueStorageService", KeyValueStorageService)
;
