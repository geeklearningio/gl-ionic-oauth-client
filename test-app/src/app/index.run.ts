'use strict';

export class RunBlock {

    /** @ngInject */
    constructor($log:angular.ILogService, ionic:any) {
        ionic.Platform.ready(() => {
            $log.info('Ionic ready');
        });
    }
}
