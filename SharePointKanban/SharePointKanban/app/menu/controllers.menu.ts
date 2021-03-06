﻿
module App.Controllers {

    export class MenuController {

        static Id = 'menuController';

        static $inject = ['$scope', 'config', '$state', '$stateParams'];

        private appTitle: string;
        private currentUser: SharePoint.ISpUser;
        private routes: Array<IUIRoute>;

        constructor(private $scope: any, private config: IConfiguration, private $state: ng.ui.IStateService, private $stateParams: IAppStateParams) {

            var $parent = this.$scope.$parent.shell;
            this.currentUser = $parent.currentUser;
            this.appTitle = config.appTitle;
            this.routes = config.routes.filter((r: IUIRoute): boolean => {
                return r.showInMenu;
            });

        }

    }

    app.controller(MenuController.Id, MenuController);
}