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
    private oAuthRedirectState;
    private successRedirectUrlAndState;
    private clientId;
    private baseAuthUrl;
    private oAuthState;
    isLoggedIn: boolean;
    isLoading: boolean;
    private authenticationCodeDidNotWork;
    constructor($rootScope: angular.IRootScopeService, $q: angular.IQService, ionic: any, $cordovaInAppBrowser: any, $state: angular.ui.IStateService, $timeout: angular.ITimeoutService, $window: any);
    /**
     * Init the Service
     * @param clientId: the app client ID
     * @param baseAuthUrl: the Login function url of your OAuth server
     */
    init(clientId: string, baseAuthUrl: string): void;
    /**
     * Handle the OAuth of your application
     * @param apiOAuthFunction: Your API function that will give you the accessToken by getting the accessCode.
     * @param successRedirectUrlAndState: the url and state of the page you want to go to when the Authentication has succeeded. (The url is needed to work in the web version of your app).
     * @param oAuthRedirectState: the state to redirect to with the accessCode as a Query param.
     */
    handleOAuth(apiOAuthFunction: Function, successRedirectUrlAndState: IUrlAndState, oAuthRedirectState?: string): void;
    private handleLogin(successRedirectUrlAndState);
    private launchOAuth(oAuthRedirectState?);
    /**
     * Configure your requests headers with the accessToken
     * @param httpRequestParams
     * @returns {any}
     */
    configureRequest(httpRequestParams: any): any;
    /**
     * Disconnect the user from your app
     * @param logoutState: the state to go to after the logout.
     */
    logout(logoutState?: string): void;
    /**
     * Refresh the accessToken using the refreshToken or logout if it fails doing so.
     * @param apiRefreshTokenFunction: the refreshToken function of your API.
     * @param logoutState: the state to got to after the logout.
     * @returns {IPromise<any>}
     */
    refreshTokenOrLogout(apiRefreshTokenFunction: Function, logoutState?: string): angular.IPromise<any>;
    private generateState();
    private handleAuthentificationCode(successRedirectUrlAndState);
    private getUrlParameter(name);
    private oAuth(accessCode);
    writeStorageAccessToken(authToken: string): void;
    private readStorageAccessToken();
    private removeStorageAccessToken();
    private writeStorageRefreshToken(refreshToken);
    private readStorageRefreshToken();
    private removeStorageRefreshToken();
    private launchExternalLink(url, target);
    private oauthLogin(code, redirect?);
}
