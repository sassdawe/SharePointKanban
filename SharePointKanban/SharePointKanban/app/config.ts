
module App {

    export interface IConfiguration {
        debug: boolean;
        appPath: string;
        isProduction: boolean;
        orgName: string;
        projectSiteUrl: string;
        projectListName: string;
        productionHostname: string;
        serverHostname: string;
        appTitle: string;
        version: string;
    }

    export class Config implements IConfiguration {

        static Id: string = 'config';

        public debug: boolean = true;
        public appPath: string = 'app/';
        public isProduction: boolean;
        public orgName: string = '';
        public projectSiteUrl: string = '/media';
        public projectListName: string = 'Projects';
        public productionHostname: string = 'webster';
        public serverHostname: string = '//' + window.location.hostname;
        public appTitle: string = 'Dev Projects Kanban';
        public version: string = '0.0.1';

        constructor() {
            this.isProduction = !!(window.location.hostname.indexOf(this.productionHostname) > -1);
        }
    }

    export var configModule: ng.IModule = angular.module('config', []);

    configModule.factory(Config.Id, [function () {
        return new Config();
    }]);

}

 