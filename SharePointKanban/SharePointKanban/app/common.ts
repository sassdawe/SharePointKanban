
module App {

    export interface ICommon {
        $rootScope: ng.IRootScopeService;
        $loader: any;
        showLoader(): void;
        hideLoader(): void;
    }

    export class Common implements ICommon {

        static Id: string = "common";

        $rootScope: ng.IRootScopeService;
        $loader: any;
       
        constructor($rootScope: ng.IRootScopeService) {
            this.$rootScope = $rootScope;
            this.$loader = $('.ajax-loader');
        }

        showLoader(): void {
            this.$loader.show();
        }

        hideLoader(): void {
            this.$loader.hide();
        }
    }
        
    export var commonModule: ng.IModule = angular.module('common', []);

    commonModule.factory(Common.Id, ['$rootScope', function ($rootScope: ng.IRootScopeService) {
        return new Common($rootScope);
    }]);

}