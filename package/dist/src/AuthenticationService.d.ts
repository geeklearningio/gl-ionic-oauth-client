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
    private $ionicPopup;
    private $window;
    static AuthenticationAccessTokenStorageKey: string;
    static AuthenticationRefreshTokenStorageKey: string;
    private cordovaInAppBrowserLoadstartUnsuscribe;
    private cordovaInAppBrowserExitUnsuscribe;
    private isAuthenticating;
    private apiOAuthFunction;
    private oAuthRedirectUrl;
    private successRedirectUrlAndState;
    private clientId;
    private baseAuthUrl;
    private oAuthState;
    private authorizationHeader;
    isLoggedIn: boolean;
    isLoading: boolean;
    constructor($rootScope: angular.IRootScopeService, $q: angular.IQService, ionic: any, $cordovaInAppBrowser: any, $state: angular.ui.IStateService, $ionicPopup: any, $window: any);
    init(clientId: string, baseAuthUrl: string, apiOAuthFunction: Function): void;
    handleLogin(successRedirectUrlAndState: IUrlAndState): boolean;
    launchOAuth(oAuthRedirectUrl?: string): void;
    getAuthorizationHeader(): string;
    setAuthorizationHeader(accessToken: string): void;
    configureRequest(httpRequestParams: any): any;
    logout(logoutState?: string): void;
    refreshTokenOrLogout(apiRefreshTokenFunction: Function, logoutState?: string): angular.IPromise<any>;
    private generateState();
    private handleAuthentificationCode(successRedirectUrlAndState);
    private getUrlParameter(name);
    private oAuth(accessCode);
    private writeStorageAccessToken(authToken);
    private writeStorageRefreshToken(refreshToken);
    private readStorageAccessToken();
    private removeStorageAccessToken();
    private readStorageRefreshToken();
    private launchExternalLink(url, target);
    private oauthLogin(code, redirect?);
}
