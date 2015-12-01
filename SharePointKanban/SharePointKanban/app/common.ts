
module App {

    export interface ICommon {
        $q: ng.IQService;
        $rootScope: ng.IRootScopeService;
        $loader: any;
        showLoader(): void;
        hideLoader(): void;
    }

    export class Common implements ICommon {

        static Id: string = "common";

        $rootScope: ng.IRootScopeService;
        $q: ng.IQService;
        $loader: any;
       
        constructor($q: ng.IQService, $rootScope: ng.IRootScopeService) {
            this.$rootScope = $rootScope;
            this.$q = $q;
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

    commonModule.factory(Common.Id, ['$q', '$rootScope', function ($q: ng.IQService, $rootScope: ng.IRootScopeService) {
        return new Common($q, $rootScope);
    }]);

}