export interface IUrlAndState {
    url: string;
    state: string;
}
export declare class AuthenticationService {
    private $rootScope;
    private $q;
    private ionic;
    private $cordovaInAppBrowser;
    private $state;
    private $timeout;
    private $window;
    static AuthenticationAccessTokenStorageKey: string;
    static AuthenticationRefreshTokenStorageKey: string;
    static AuthenticationOAuthError: string;
    static AuthenticationOAuthSuccess: string;
    private cordovaInAppBrowserLoadstartUnsuscribe;
    private cordovaInAppBrowserExitUnsuscribe;
    private isAuthenticating;
    private apiOAuthFunction;
    private oAuthRedirectUrl;
    private successRedirectUrlAndState;
    private clientId;
    private baseAuthUrl;
    private oAuthState;
    isLoggedIn: boolean;
    isLoading: boolean;
    private authenticationCodeDidNotWork;
    constructor($rootScope: angular.IRootScopeService, $q: angular.IQService, ionic: any, $cordovaInAppBrowser: any, $state: angular.ui.IStateService, $timeout: angular.ITimeoutService, $window: any);
    init(clientId: string, baseAuthUrl: string): void;
    handleOAuth(apiOAuthFunction: Function, successRedirectUrlAndState: IUrlAndState, oAuthRedirectUrl?: string): void;
    private handleLogin(successRedirectUrlAndState);
    private launchOAuth(oAuthRedirectUrl?);
    configureRequest(httpRequestParams: any): any;
    logout(logoutState?: string): void;
    refreshTokenOrLogout(apiRefreshTokenFunction: Function, logoutState?: string): angular.IPromise<any>;
    private generateState();
    private handleAuthentificationCode(successRedirectUrlAndState);
    private getUrlParameter(name);
    private oAuth(accessCode);
    private writeStorageAccessToken(authToken);
    private readStorageAccessToken();
    private removeStorageAccessToken();
    private writeStorageRefreshToken(refreshToken);
    private readStorageRefreshToken();
    private removeStorageRefreshToken();
    private launchExternalLink(url, target);
    private oauthLogin(code, redirect?);
}
