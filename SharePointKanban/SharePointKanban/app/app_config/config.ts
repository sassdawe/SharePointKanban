
module App {

    export interface IConfiguration {
        debug: boolean;
        appPath: string;
        appTitle: string;
        editGroups: Array<string>;
        orgName: string;
        priorities: Array<string>;
        serverHostname: string;
        version: string;
        routes: Array<any>;
    }

    // Reusable views for the Angular UI Routes
    // Alter to fit your configuration

    /**
     * Setup your SharePoint host application configurations here and in /app/dvr/Views.ts
     */
    export class Config implements IConfiguration {

        static Id: string = 'config';

        public debug: boolean = false;
        public appPath: string = 'app/'; //path to Angular app template files
        public appTitle: string = 'Dev Projects Kanban'; //display title of the app
        public editGroups: Array<string> = ['Developers', 'Testers', 'Managers']; // list of SharePoint group names allowed to save changes
        public isProduction: boolean; //if this isn't the production site, get test data
        public orgName: string = ''; //the name of your organization, shown in Copyright
        public priorities: Array<string> = ['(1) High', '(2) Normal', '(3) Low'];     
        public serverHostname: string = '//' + window.location.hostname;
        public version: string = '0.0.1';

        // Angular UI Routes
        public routes = [

            // Top-level abstract route
            { 
                route: 'app',
                showInMenu: false,
                model: {
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
                        currentUser: ['datacontext', function (datacontext: Services.IDatacontext) {
                            return datacontext.getCurrentUser();
                        }]
                    }
                }
            }

            // A Kanban route
            , { 
                title: 'Projects',
                showInMenu: true,
                route: 'app.home',
                model: {
                    // use same url as parent - '/' + '' = '/'
                    url: '',

                    // If there is more than a single ui-view in the parent template, or you would
                    // like to target a ui-view from even higher up the state tree, you can use the
                    // views object to configure multiple Views. Each view can get its own template,
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
                        'main@app': Views.projects,

                        ////////////
                        // Footer
                        ////////////
                        'footer@app': Views.footer
                    }
                }
            }

            // The Report Summary route
            , { 
                title: 'Summary',
                showInMenu: true,
                route: 'app.summary', 
                model: {
                    url: 'summary',
                    views: {
                        'menu@app': Views.menu,
                        'main@app': Views.summary,
                        'footer@app': Views.footer
                    }
                }
            }

            // The Report Summary route with optional date range parameters
            , { 
                route: 'app.summary.range', 
                showInMenu: false,
                model: {
                    url: '/start/{start:[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}}/end/{end:[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}}',
                    views: {
                        'menu@app': Views.menu,
                        'main@app': Views.summary,
                        'footer@app': Views.footer
                    }
                }
            }
        ];

        constructor() {
            
        }
    }

    export var configModule: ng.IModule = angular.module('config', []);

    configModule.factory(Config.Id, [function () {
        return new Config();
    }]);

}

 