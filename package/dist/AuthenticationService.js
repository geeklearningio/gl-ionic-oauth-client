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
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var KeyValueStorageService_1 = __webpack_require__(2);
	var AuthenticationService = (function () {
	    /* @ngInject */
	    AuthenticationService.$inject = ["$rootScope", "$q", "ionic", "$cordovaInAppBrowser", "$state", "$timeout", "$window", "keyValueStorageService"];
	    function AuthenticationService($rootScope, $q, ionic, $cordovaInAppBrowser, $state, $timeout, $window, keyValueStorageService) {
	        this.$rootScope = $rootScope;
	        this.$q = $q;
	        this.ionic = ionic;
	        this.$cordovaInAppBrowser = $cordovaInAppBrowser;
	        this.$state = $state;
	        this.$timeout = $timeout;
	        this.$window = $window;
	        this.keyValueStorageService = keyValueStorageService;
	        this.cordovaInAppBrowserLoadstartUnsuscribe = null;
	        this.cordovaInAppBrowserExitUnsuscribe = null;
	        this.getAndSetCurrentAccessToken();
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
	     * check if user is already logged in
	     * @returns {IPromise<boolean>}
	     */
	    AuthenticationService.prototype.isAuthenticated = function () {
	        var deferred = this.$q.defer();
	        if (this.currentAccessToken) {
	            deferred.resolve(true);
	        }
	        else {
	            this.getAndSetCurrentAccessToken()
	                .then(function (accessToken) {
	                if (accessToken) {
	                    deferred.resolve(true);
	                }
	                else {
	                    deferred.resolve(false);
	                }
	            });
	        }
	        return deferred.promise;
	    };
	    /**
	     * get current access token and save it for later if not set
	     * @returns {IPromise<any>}
	     */
	    AuthenticationService.prototype.getCurrentAccessToken = function () {
	        var deferred = this.$q.defer();
	        if (this.currentAccessToken) {
	            deferred.resolve(this.currentAccessToken);
	        }
	        else {
	            return this.getAndSetCurrentAccessToken();
	        }
	        return deferred.promise;
	    };
	    /**
	     * get current access token from storage and save it for later
	     * @returns {IPromise<any>}
	     */
	    AuthenticationService.prototype.getAndSetCurrentAccessToken = function () {
	        var _this = this;
	        var deferred = this.$q.defer();
	        this.readStorageAccessToken()
	            .then(function (accessToken) {
	            if (accessToken) {
	                _this.currentAccessToken = accessToken;
	                deferred.resolve(accessToken);
	            }
	            else {
	                deferred.resolve(null);
	            }
	        });
	        return deferred.promise;
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
	        this.handleLogin(successRedirectUrlAndState)
	            .then(function (isAuthenticated) {
	            if (!isAuthenticated) {
	                _this.authenticationCodeDidNotWork = false;
	                if (_this.ionic.Platform.isReady || !_this.ionic.Platform.isWebView()) {
	                    _this.launchOAuth(oAuthRedirectState);
	                }
	                else {
	                    // if ionic is not ready, wait for 1 second before launching the In App browser or it won't launch on iOS...
	                    _this.ionic.Platform.ready(function () {
	                        _this.$timeout(function () {
	                            _this.launchOAuth(oAuthRedirectState);
	                        }, 1000);
	                    });
	                }
	            }
	        });
	    };
	    AuthenticationService.prototype.handleLogin = function (successRedirectUrlAndState) {
	        var _this = this;
	        var deferred = this.$q.defer();
	        if (this.handleAuthentificationCode(successRedirectUrlAndState)) {
	            deferred.resolve(true);
	        }
	        else {
	            this.isAuthenticated()
	                .then(function (isAuthenticated) {
	                if (isAuthenticated) {
	                    _this.$state.go(successRedirectUrlAndState.state);
	                }
	                deferred.resolve(isAuthenticated);
	            });
	        }
	        return deferred.promise;
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
	        httpRequestParams.headers['Authorization'] = 'Bearer ' + this.currentAccessToken;
	        if (!this.currentAccessToken) {
	            console.error('Error: Trying to call an api function before the access token has been retrieved');
	        }
	        return httpRequestParams;
	    };
	    /**
	     * Disconnect the user from your app
	     * @param logoutState: the state to go to after the logout.
	     */
	    AuthenticationService.prototype.logout = function (logoutState) {
	        var _this = this;
	        if (logoutState === void 0) { logoutState = 'login'; }
	        var deferred = this.$q.defer();
	        var removalSuccessCount = 0;
	        this.currentAccessToken = null;
	        this.removeStorageRefreshToken();
	        this.removeStorageAccessToken()
	            .then(function () {
	            _this.$state.go(logoutState);
	            deferred.resolve();
	        });
	        return deferred.promise;
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
	        this.readStorageRefreshToken()
	            .then(function (refreshToken) {
	            if (refreshToken) {
	                apiRefreshTokenFunction({
	                    authRequest: {
	                        refreshToken: refreshToken
	                    }
	                })
	                    .then(function (result) {
	                    _this.$rootScope.$broadcast(AuthenticationService.AuthenticationOAuthSuccess);
	                    _this.writeStorageAccessToken(result.data.content.accessToken);
	                    deferred.resolve(result);
	                }, function (error) {
	                    _this.logout();
	                    deferred.reject(error);
	                });
	            }
	            else {
	                _this.logout();
	                deferred.reject('no refresh token found');
	            }
	        });
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
	        this.keyValueStorageService.set(AuthenticationService.AuthenticationAccessTokenStorageKey, authToken);
	        this.currentAccessToken = authToken;
	    };
	    AuthenticationService.prototype.readStorageAccessToken = function () {
	        var deferred = this.$q.defer();
	        this.keyValueStorageService.get(AuthenticationService.AuthenticationAccessTokenStorageKey)
	            .then(function (value) {
	            deferred.resolve(value);
	        }, function () {
	            deferred.resolve(null);
	        });
	        return deferred.promise;
	    };
	    AuthenticationService.prototype.removeStorageAccessToken = function () {
	        return this.keyValueStorageService.remove(AuthenticationService.AuthenticationAccessTokenStorageKey);
	    };
	    AuthenticationService.prototype.writeStorageRefreshToken = function (refreshToken) {
	        this.keyValueStorageService.set(AuthenticationService.AuthenticationRefreshTokenStorageKey, refreshToken);
	    };
	    AuthenticationService.prototype.readStorageRefreshToken = function () {
	        var deferred = this.$q.defer();
	        this.keyValueStorageService.get(AuthenticationService.AuthenticationRefreshTokenStorageKey)
	            .then(function (value) {
	            deferred.resolve(value);
	        });
	        return deferred.promise;
	    };
	    AuthenticationService.prototype.removeStorageRefreshToken = function () {
	        this.keyValueStorageService.remove(AuthenticationService.AuthenticationRefreshTokenStorageKey);
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
	    .service("authenticationService", AuthenticationService)
	    .service("keyValueStorageService", KeyValueStorageService_1.KeyValueStorageService);


/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';
	var KeyValueStorageService = (function () {
	    /* @ngInject */
	    KeyValueStorageService.$inject = ["$q", "$timeout"];
	    function KeyValueStorageService($q, $timeout) {
	        this.$q = $q;
	        this.$timeout = $timeout;
	    }
	    KeyValueStorageService.prototype.get = function (key) {
	        var deferred = this.$q.defer();
	        deferred.resolve(localStorage.getItem(key));
	        return deferred.promise;
	    };
	    KeyValueStorageService.prototype.set = function (key, value) {
	        var deferred = this.$q.defer();
	        localStorage.setItem(key, value);
	        deferred.resolve();
	        return deferred.promise;
	    };
	    KeyValueStorageService.prototype.remove = function (key) {
	        var deferred = this.$q.defer();
	        delete window.localStorage[key];
	        deferred.resolve();
	        return deferred.promise;
	    };
	    return KeyValueStorageService;
	}());
	exports.KeyValueStorageService = KeyValueStorageService;


/***/ }
/******/ ]);