
module App.Controllers {

    export class MenuController {

        static Id = 'menuController';

        static $inject = ['config', '$state', '$stateParams'];

        private appTitle: string;

        constructor(private config: IConfiguration, private $state: ng.ui.IStateService, private $stateParams: IAppStateParams) {

            this.appTitle = config.appTitle;
        }

    }

    app.controller(MenuController.Id, MenuController);
}