'use strict';

export interface IKeyValueStorageService {
    get(key: string): angular.IPromise<string>;
    set(key: string, value: any): angular.IPromise<any>;
    remove(key: string): angular.IPromise<any>;
}

export class KeyValueStorageService implements IKeyValueStorageService{

    /* @ngInject */
    constructor(private $q:angular.IQService, private $timeout: angular.ITimeoutService) {

    }

    public get(key: string): angular.IPromise<string> {
        var deferred:ng.IDeferred<any> = this.$q.defer();
        deferred.resolve(<string>localStorage.getItem(key));
        return deferred.promise;
    }

    public set(key: string, value: string): angular.IPromise<any> {
        var deferred:ng.IDeferred<any> = this.$q.defer();
        localStorage.setItem(key, value);
        deferred.resolve();
        return deferred.promise;
    }

    remove(key: string): angular.IPromise<any> {
        var deferred:ng.IDeferred<any> = this.$q.defer();
        delete window.localStorage[key];
        deferred.resolve();
        return deferred.promise;
    }
}
