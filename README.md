# Introduction
This is an OAuth npm component, which can used in any Ionic framework's application.
There is a test app using this OAuth Service to show how to configure and use it.

# Requirements
- npm
- ionic
- [cordova-plugin-inappbrowser](https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-inappbrowser/)

# How to configure
1) In your project folder, install this plugin using npm
`npm install git+https://git@github.com/geeklearningio/gl-ionic-oauth-client.git --save`

2) You can use the Typescript (`package/src/AuthenticationService.ts`) or the Javascript ((`package/dist/AuthenticationService.js`)) version of the Service.

3) In your application's main module, inject the dependency `gl-ionic-oauth-client` in order to use the Service.
```
angular.module('mainModuleName', ['ionic', 'gl-ionic-oauth-client']){
//
}
```

# How to use

## Init
Init the service by calling the `init` function, giving the client-id and the url of your Login function of your OAuth server.
```
// TODO: change these fields to connect to your oAuth server
var clientId = "clientId";
var oauthUrl = "https://your-oauth-server/Login";

this.authenticationService.init(clientId, oauthUrl);
```
## OAuth call
Call the `handleOAuth` function with these params :
- Your API function that will give you the accessToken by getting the accessCode.
- the url and state of the page you want to go to when the Authentication has succeeded. (The url is needed to work in the web version of your app).
- the state to redirect to with the accessCode as a Query param.
````
var apiOAuthFunction = this.fakeAPIService.connect.bind(this.fakeAPIService);
var oauthRedirectState = 'main';
var successRedirectUrlAndState = {
    state: 'success',
    url: 'success'
};
this.authenticationService.handleOAuth(apiOAuthFunction, successRedirectUrlAndState, oauthRedirectUrl);
````

# Useful functions and events

## Success and Error events
This OAuth Service broadcasts success and error events to let you handle these properly:
```
this.$rootScope.$on(AuthenticationService.AuthenticationOAuthError, () => {
    console.log('connecton error');
});
```
```
this.$rootScope.$on(AuthenticationService.AuthenticationOAuthSuccess, () => {
    console.log('connecton succeeded');
});
```

## Logout function
You can disconnect the user of your application by calling the `logout` function that will clear the accessToken and the refreshToken of your cache. The parameter is the state to go to after the logout.
```
this.authenticationService.logout('main');
```

## Refresh Token function
You can refresh your accessToken by using the refreshToken given by your API at your first login. Just call the `refreshTokenOrLogout` that will refresh your token or logout if it fails doing so. You will have to pass it 2 params:
- the refreshToken function of your API.
- the state to got to after the logout.
```
var apiRefreshTokenFunction = this.fakeAPIService.refreshToken.bind(this.fakeAPIService);
this.authenticationService.refreshTokenOrLogout(apiRefreshTokenFunction, 'main').then((result) => {
    this.newAccessToken = result.data.content.accessToken;
});
```

## How to use the test app
the test app does not have the package as a dependency. It allows you to make changes directly to the package and use it in your test app.

You need to link the package locally.
At the root of the project (containing the `package` and the `test-app` folders) type this in the terminal:
```
npm link
```
It will add `gl-ionic-oauth-client` as a global npm module.

Then go in the test-app folder and type this:
```
npm link gl-ionic-oauth-client
```
It will link it to the test-app.










