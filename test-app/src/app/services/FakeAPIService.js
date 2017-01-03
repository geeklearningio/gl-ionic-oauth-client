/**
 * Created by Vidailhet on 24/06/16.
 */
"use strict";
var FakeAPIService = (function () {
    /** @ngInject */
    function FakeAPIService($q, $timeout) {
        this.$q = $q;
        this.$timeout = $timeout;
    }
    FakeAPIService.prototype.connect = function () {
        var deferred = this.$q.defer();
        this.$timeout(function () {
            deferred.resolve({
                data: {
                    content: {
                        accessToken: 'token',
                        refreshToken: 'refreshToken'
                    }
                }
            });
        }, 1000);
        return deferred.promise;
    };
    FakeAPIService.prototype.refreshToken = function (refreshToken) {
        var deferred = this.$q.defer();
        this.$timeout(function () {
            deferred.resolve({
                data: {
                    content: {
                        accessToken: 'newToken'
                    }
                }
            });
        }, 1000);
        return deferred.promise;
    };
    return FakeAPIService;
}());
exports.FakeAPIService = FakeAPIService;
