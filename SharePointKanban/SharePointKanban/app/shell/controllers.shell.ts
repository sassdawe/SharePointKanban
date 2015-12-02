
module App.Controllers
{
    export interface IShellController {
        currentUser: SharePoint.ISpUser;
    }

    export class ShellController implements IShellController
    {
        public static Id = 'shellController';

        static $inject = ['$rootScope', 'config', 'currentUser'];

        public currentUser: SharePoint.ISpUser;

        constructor(private $rootScope: ng.IRootScopeService, private config: IConfiguration, currentUser: SharePoint.ISpUser)
        {
            this.currentUser = currentUser;
        }

    }

    // Register with angular
    app.controller(ShellController.Id, ShellController);
}