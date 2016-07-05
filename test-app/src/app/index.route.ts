'use strict';

export class RouterConfig {
    /** @ngInject */
    constructor($stateProvider: ng.ui.IStateProvider, $urlRouterProvider: ng.ui.IUrlRouterProvider) {
        $stateProvider
            .state('main',
            {
                url: '/main',
                template: require('./views/main/main.html'),
                controller: 'MainController',
                controllerAs: 'main'
            })
            .state('success',
                {
                    url: '/success',
                    template: require('./views/success/success.html'),
                    controller: 'SuccessController',
                    controllerAs: 'success'
                });

        $urlRouterProvider.otherwise('/main');
    }
}
