'use strict';
var KeyValueStorageService = (function () {
    /* @ngInject */
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
