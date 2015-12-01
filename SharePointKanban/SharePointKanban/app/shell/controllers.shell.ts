
module App.Controllers
{
    export class ShellController
    {
        public static Id = 'shellController';

        static $inject = ['$rootScope'];

        constructor(private $rootScope: ng.IRootScopeService)
        {

        }

    }

    // Register with angular
    app.controller(ShellController.Id, ShellController);
}