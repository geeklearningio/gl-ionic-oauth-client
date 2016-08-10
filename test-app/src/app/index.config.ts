'use strict';
import {KeyValueStorageService} from "./services/KeyValueStorageService";

export class Config {
    /** @ngInject */
    constructor($logProvider: angular.ILogProvider, $provide: any) {
        // enable log
        $logProvider.debugEnabled(true);

        // you can override the default keyValueStorageService like this
        $provide.service('keyValueStorageService', KeyValueStorageService);
    }

}
