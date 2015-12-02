
/**
* Central configuration of all application state routes via Angular UI Router
* 
* Inject not only reusable dependencies but reusable views to assemble dashboards in any way necessary! Perfect Dependency Injection.
* 'DVR - Dependencies, Views, and Routes' - John Bonfardeci
*/
module App{

    /**
    * Extends IStateParamsService to include custom url parameters for Angular UI Router states.
    */
    export interface IAppStateParams extends ng.ui.IStateParamsService {

    }

    export class Routes {

        static $inject = ['$stateProvider', '$urlRouterProvider'];

        constructor($stateProvider: ng.ui.IStateProvider, $urlRouterProvider: ng.ui.IUrlRouterProvider) {

            // the default url if url doesn't match any of the Angular UI Router states
            $urlRouterProvider.otherwise('/');

            // Setup the Angular UI Router states
            $stateProvider.state('app', {
                // With abstract set to true, that means this state can not be explicitly activated.
                // It can only be implicitly activated by activating one of its children.
                abstract: true,

                // This abstract state will prepend '/' onto the urls of all its children.
                url: '/',

                // This is the top level state, so this template file will be loaded and then inserted into the ui-view within index.html.
                templateUrl: 'app/shell/shell.htm',
                controller: Controllers.ShellController.Id,
                controllerAs: 'shell',
                resolve: {
                    currentUser: Dependencies.currentUser
                }
            });

            //////////////
            // Shell > Home
            //////////////
            // Using a '.' within a state name declares a child within a parent.
            // So you have a new state 'menu' within the parent 'cds' state.
            // You can have unlimited children within a state's `views` property!
            $stateProvider.state('app.home', {

                // use same url as parent - '/' + '' = '/'
                url: '',

                // If there is more than a single ui-view in the parent template, or you would
                // like to target a ui-view from even higher up the state tree, you can use the
                // views object to configure multiple views. Each view can get its own template,
                // controller, and resolve data.

                // View names can be relative or absolute. Relative view names do not use an '@'
                // symbol. They always refer to views within this state's parent template.
                // Absolute view names use a '@' symbol to distinguish the view and the state.
                // So 'foo@bar' means the ui-view named 'foo' within the 'bar' state's template.
                views: {
                    ////////////
                    // Main Menu
                    ////////////
                    // viewName@stateName
                    'menu@app': Views.menu,

                    ////////////
                    // Home
                    ////////////
                    'main@app': Views.home,

                    ////////////
                    // Footer
                    ////////////
                    'footer@app': Views.footer
                }
            });

        }

    }

    app.config(Routes);

}