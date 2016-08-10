'use strict';

export interface IKeyValueStorageService {
    get(key: string): string;
    set(key: string, value: string);
    remove(key: string);
}

export class LocalStorageKeyValueStorageService implements IKeyValueStorageService{

    /* @ngInject */
    constructor() {

    }

    public get(key: string): string {
        return <string>localStorage.getItem(key);
    }

    public set(key: string, value: string) {
        localStorage.setItem(key, value);
    }

    remove(key: string) {
        delete window.localStorage[key];
    }
}
