/// <reference path="../../typings/index.d.ts" />
/// <reference path="index.d.ts" />

'use strict';

import 'ionic-sdk/release/js/ionic.bundle';
import 'gl-ionic-oauth-client/package/src/AuthenticationService';
import 'ng-cordova';

//add root style dependency
//import './style';

declare var exports: any;

import {MainController} from './views/main/MainController.ts';
import {Config} from  './index.config.ts';
import {RouterConfig} from  './index.route.ts';
import {RunBlock} from  './index.run.ts';
import {FakeAPIService} from "./services/FakeAPIService";
import {SuccessController} from "./views/success/SuccessController";

exports = angular.module('testApp', [
    'ionic',
    'ui.router',
    'gl-ionic-oauth-client',
    'ngCordova',
    'ngAnimate'])
    .config(Config)
    .constant('ionic', (<any>window).ionic)

    .service ('fakeAPIService', FakeAPIService)

    .config(RouterConfig)

    .run(RunBlock)
    .controller('MainController', MainController)
    .controller('SuccessController', SuccessController)
    ;
