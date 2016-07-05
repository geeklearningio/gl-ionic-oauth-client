/**
 * Created by Vidailhet on 24/06/16.
 */

export class FakeAPIService {

    /** @ngInject */
    constructor(private $q: angular.IQService, private $timeout: angular.ITimeoutService) {
    }

    connect () {
        var deferred:ng.IDeferred<any> = this.$q.defer();
        this.$timeout(() => {
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
    }

    refreshToken (refreshToken: string) {
        var deferred:ng.IDeferred<any> = this.$q.defer();
        this.$timeout(() => {
            deferred.resolve({
                data: {
                    content: {
                        accessToken: 'newToken'
                    }
                }
            });
        }, 1000);
        return deferred.promise;
    }

}
