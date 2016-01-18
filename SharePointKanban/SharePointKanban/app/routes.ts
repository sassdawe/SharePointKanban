
/**
* Central configuration of all application state routes via Angular UI Router
* 
* Inject not only reusable dependencies but reusable views to assemble dashboards in any way necessary! Perfect Dependency Injection.
* 'DVR - Dependencies, Views, and Routes' - John Bonfardeci
*/
module App {

    export class Routes {

        static $inject = ['config', '$stateProvider', '$urlRouterProvider'];

        constructor(config: IConfiguration, $stateProvider: ng.ui.IStateProvider, $urlRouterProvider: ng.ui.IUrlRouterProvider) {
            // the default url if url doesn't match any of the Angular UI Router states
            $urlRouterProvider.otherwise('/');

            config.routes.forEach((r: IUIRoute): void => {
                $stateProvider.state(r.route, r.model);
            });
        }

    }

    app.config(Routes);

}