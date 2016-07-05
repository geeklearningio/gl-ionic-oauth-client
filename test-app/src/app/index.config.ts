'use strict';

export class Config {
    /** @ngInject */
    constructor($logProvider: angular.ILogProvider) {
        // enable log
        $logProvider.debugEnabled(true);
    }

}
