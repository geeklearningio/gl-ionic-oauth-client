export interface IKeyValueStorageService {
    get(key: string): angular.IPromise<string>;
    set(key: string, value: any): angular.IPromise<any>;
    remove(key: string): angular.IPromise<any>;
}
export declare class LocalStorageKeyValueStorageService implements IKeyValueStorageService {
    private $q;
    private $timeout;
    constructor($q: angular.IQService, $timeout: angular.ITimeoutService);
    get(key: string): angular.IPromise<string>;
    set(key: string, value: string): angular.IPromise<any>;
    remove(key: string): angular.IPromise<any>;
}
