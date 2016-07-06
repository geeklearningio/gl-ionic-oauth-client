/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";
	var AuthenticationService = (function () {
	    /* @ngInject */
	    AuthenticationService.$inject = ["$rootScope", "$q", "ionic", "$cordovaInAppBrowser", "$state", "$timeout", "$window"];
	    function AuthenticationService($rootScope, $q, ionic, $cordovaInAppBrowser, $state, $timeout, $window) {
	        this.$rootScope = $rootScope;
	        this.$q = $q;
	        this.ionic = ionic;
	        this.$cordovaInAppBrowser = $cordovaInAppBrowser;
	        this.$state = $state;
	        this.$timeout = $timeout;
	        this.$window = $window;
	        this.cordovaInAppBrowserLoadstartUnsuscribe = null;
	        this.cordovaInAppBrowserExitUnsuscribe = null;
	        if (this.readStorageAccessToken()) {
	            this.isLoggedIn = true;
	        }
	        else {
	            this.isLoggedIn = false;
	        }
	    }
	    /**
	     * Init the Service
	     * @param clientId: the app client ID
	     * @param baseAuthUrl: the Login function url of your OAuth server
	     */
	    AuthenticationService.prototype.init = function (clientId, baseAuthUrl) {
	        this.clientId = clientId;
	        this.baseAuthUrl = baseAuthUrl;
	        this.generateState();
	    };
	    /**
	     * Handle the OAuth of your application
	     * @param apiOAuthFunction: Your API function that will give you the accessToken by getting the accessCode.
	     * @param successRedirectUrlAndState: the url and state of the page you want to go to when the Authentication has succeeded. (The url is needed to work in the web version of your app).
	     * @param oAuthRedirectState: the state to redirect to with the accessCode as a Query param.
	     */
	    AuthenticationService.prototype.handleOAuth = function (apiOAuthFunction, successRedirectUrlAndState, oAuthRedirectState) {
	        var _this = this;
	        if (oAuthRedirectState === void 0) { oAuthRedirectState = 'login'; }
	        this.apiOAuthFunction = apiOAuthFunction;
	        if (!this.handleLogin(successRedirectUrlAndState)) {
	            this.authenticationCodeDidNotWork = false;
	            if (this.ionic.Platform.isReady || !this.ionic.Platform.isWebView()) {
	                this.launchOAuth(oAuthRedirectState);
	            }
	            else {
	                // if ionic is not ready, wait for 1 second before launching the In App browser or it won't launch on iOS...
	                this.ionic.Platform.ready(function () {
	                    _this.$timeout(function () {
	                        _this.launchOAuth(oAuthRedirectState);
	                    }, 1000);
	                });
	            }
	        }
	    };
	    AuthenticationService.prototype.handleLogin = function (successRedirectUrlAndState) {
	        if (this.handleAuthentificationCode(successRedirectUrlAndState)) {
	            return true;
	        }
	        if (this.isLoggedIn) {
	            this.$state.go(successRedirectUrlAndState.state);
	            return true;
	        }
	        return false;
	    };
	    AuthenticationService.prototype.launchOAuth = function (oAuthRedirectState) {
	        if (oAuthRedirectState === void 0) { oAuthRedirectState = 'login'; }
	        this.isLoading = true;
	        this.oAuthRedirectState = oAuthRedirectState;
	        var redirectUri = document.URL + this.oAuthRedirectState;
	        if (this.ionic.Platform.isWebView()) {
	            redirectUri = 'http://localhost/#/' + this.oAuthRedirectState;
	        }
	        var authUrl = this.baseAuthUrl + '?protocol=oauth2&scope=' +
	            '&client_id=' + this.clientId +
	            '&state=' + this.oAuthState +
	            '&response_type=code&redirect_uri=' + encodeURIComponent(redirectUri);
	        this.launchExternalLink(authUrl, '_blank');
	    };
	    /**
	     * Configure your requests headers with the accessToken
	     * @param httpRequestParams
	     * @returns {any}
	     */
	    AuthenticationService.prototype.configureRequest = function (httpRequestParams) {
	        httpRequestParams.headers['Authorization'] = 'Bearer ' + this.readStorageAccessToken();
	        return httpRequestParams;
	    };
	    /**
	     * Disconnect the user from your app
	     * @param logoutState: the state to go to after the logout.
	     */
	    AuthenticationService.prototype.logout = function (logoutState) {
	        if (logoutState === void 0) { logoutState = 'login'; }
	        this.isLoggedIn = false;
	        this.removeStorageAccessToken();
	        this.removeStorageRefreshToken();
	        this.$state.go(logoutState);
	    };
	    /**
	     * Refresh the accessToken using the refreshToken or logout if it fails doing so.
	     * @param apiRefreshTokenFunction: the refreshToken function of your API.
	     * @param logoutState: the state to got to after the logout.
	     * @returns {IPromise<any>}
	     */
	    AuthenticationService.prototype.refreshTokenOrLogout = function (apiRefreshTokenFunction, logoutState) {
	        var _this = this;
	        if (logoutState === void 0) { logoutState = 'login'; }
	        var deferred = this.$q.defer();
	        this.isLoading = true;
	        var refreshToken = this.readStorageRefreshToken();
	        if (refreshToken) {
	            apiRefreshTokenFunction({
	                authRequest: {
	                    refreshToken: refreshToken
	                }
	            })
	                .then(function (result) {
	                _this.$rootScope.$broadcast(AuthenticationService.AuthenticationOAuthSuccess);
	                _this.writeStorageAccessToken(result.data.content.accessToken);
	                _this.isLoading = false;
	                deferred.resolve(result);
	            }, function (error) {
	                _this.isLoading = false;
	                _this.logout();
	                deferred.reject(error);
	            });
	        }
	        else {
	            this.isLoading = false;
	            this.logout();
	            deferred.resolve();
	        }
	        return deferred.promise;
	    };
	    AuthenticationService.prototype.generateState = function () {
	        var text = "";
	        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	        for (var i = 0; i < 15; i++)
	            text += possible.charAt(Math.floor(Math.random() * possible.length));
	        this.oAuthState = text;
	    };
	    AuthenticationService.prototype.handleAuthentificationCode = function (successRedirectUrlAndState) {
	        if (this.authenticationCodeDidNotWork) {
	            return;
	        }
	        this.successRedirectUrlAndState = successRedirectUrlAndState;
	        this.isLoading = true;
	        var code = this.getUrlParameter('code');
	        if (code) {
	            this.oauthLogin(code);
	            return true;
	        }
	        else {
	            this.isLoading = false;
	        }
	        return false;
	    };
	    AuthenticationService.prototype.getUrlParameter = function (name) {
	        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"), results = regex.exec(location.search);
	        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	    };
	    AuthenticationService.prototype.oAuth = function (accessCode) {
	        var _this = this;
	        var deferred = this.$q.defer();
	        this.apiOAuthFunction({
	            authRequest: {
	                redirectUri: document.URL + 'oauthresponse',
	                authorizationCode: accessCode
	            }
	        })
	            .then(function (result) {
	            _this.writeStorageAccessToken(result.data.content.accessToken);
	            _this.writeStorageRefreshToken(result.data.content.refreshToken);
	            deferred.resolve(result);
	        }, function (error) {
	            deferred.reject(error);
	        });
	        return deferred.promise;
	    };
	    AuthenticationService.prototype.writeStorageAccessToken = function (authToken) {
	        localStorage.setItem(AuthenticationService.AuthenticationAccessTokenStorageKey, authToken);
	    };
	    AuthenticationService.prototype.readStorageAccessToken = function () {
	        return localStorage.getItem(AuthenticationService.AuthenticationAccessTokenStorageKey);
	    };
	    AuthenticationService.prototype.removeStorageAccessToken = function () {
	        delete window.localStorage[AuthenticationService.AuthenticationAccessTokenStorageKey];
	    };
	    AuthenticationService.prototype.writeStorageRefreshToken = function (refreshToken) {
	        localStorage.setItem(AuthenticationService.AuthenticationRefreshTokenStorageKey, refreshToken);
	    };
	    AuthenticationService.prototype.readStorageRefreshToken = function () {
	        return localStorage.getItem(AuthenticationService.AuthenticationRefreshTokenStorageKey);
	    };
	    AuthenticationService.prototype.removeStorageRefreshToken = function () {
	        delete window.localStorage[AuthenticationService.AuthenticationRefreshTokenStorageKey];
	    };
	    AuthenticationService.prototype.launchExternalLink = function (url, target) {
	        var _this = this;
	        var options = null;
	        if (!this.ionic.Platform.isWebView()) {
	            this.$window.location.href = url;
	        }
	        else {
	            options = {
	                location: 'no',
	                toolbar: 'yes',
	                closebuttoncaption: 'Fermer'
	            };
	            this.$cordovaInAppBrowser.open(url, target, options);
	            if (this.cordovaInAppBrowserLoadstartUnsuscribe === null) {
	                // general case (IOS & Android)
	                this.cordovaInAppBrowserLoadstartUnsuscribe = this.$rootScope.$on('$cordovaInAppBrowser:loadstart', function (e, event) {
	                    var url = event.url;
	                    var codeReg = /\?code=([^&#]+)/.exec(url);
	                    var errorReg = /\?error=([^&#]+)/.exec(url);
	                    var called = false;
	                    if (!called && codeReg) {
	                        called = true;
	                        _this.$cordovaInAppBrowser.close();
	                        _this.isAuthenticating = true;
	                        _this.oauthLogin(codeReg[1], false);
	                    }
	                    else if (errorReg) {
	                        onFailure(errorReg[1]);
	                    }
	                });
	                // user went back
	                this.cordovaInAppBrowserExitUnsuscribe = this.$rootScope.$on('$cordovaInAppBrowser:exit', function (e, event) {
	                    if (!_this.isAuthenticating) {
	                        _this.isLoading = false;
	                    }
	                });
	                var onFailure = function (reason) {
	                    _this.isLoading = false;
	                    _this.$cordovaInAppBrowser.close();
	                    _this.$rootScope.$broadcast(AuthenticationService.AuthenticationOAuthError);
	                };
	            }
	        }
	    };
	    AuthenticationService.prototype.oauthLogin = function (code, redirect) {
	        var _this = this;
	        if (redirect === void 0) { redirect = true; }
	        this.oAuth(code)
	            .then(function (result) {
	            _this.$rootScope.$broadcast(AuthenticationService.AuthenticationOAuthSuccess);
	            _this.isAuthenticating = false;
	            _this.isLoading = false;
	            var tempArr = document.URL.split('/?');
	            if (redirect) {
	                _this.$window.location.href = tempArr[0] + '/#/' + _this.successRedirectUrlAndState.url;
	            }
	            else {
	                _this.$state.go(_this.successRedirectUrlAndState.state);
	            }
	        }, function (error) {
	            // if the authentication code didn't work, do not try to use it again
	            _this.authenticationCodeDidNotWork = true;
	            _this.$rootScope.$broadcast(AuthenticationService.AuthenticationOAuthError);
	            _this.isLoading = false;
	        });
	    };
	    AuthenticationService.AuthenticationAccessTokenStorageKey = "authentication.service.accessToken";
	    AuthenticationService.AuthenticationRefreshTokenStorageKey = "authentication.service.refreshToken";
	    AuthenticationService.AuthenticationOAuthError = 'authentication.service.oauthError';
	    AuthenticationService.AuthenticationOAuthSuccess = 'authentication.service.oauthSuccess';
	    return AuthenticationService;
	}());
	exports.AuthenticationService = AuthenticationService;
	exports = angular.module("gl-ionic-oauth-client", [])
	    .service("authenticationService", AuthenticationService);


/***/ }
/******/ ]);