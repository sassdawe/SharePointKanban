
module App {

    export interface IConfiguration {
        debug: boolean;
        orgName: string;
        appPath: string;
        appTitle: string;
        projectSiteUrl: string;
        projectListName: string;
        serverHostname: string;
        version: string;
    }

    export class Config implements IConfiguration {

        static Id: string = 'config';

        public debug: boolean = true;
        public orgName: string = '';
        public appPath: string = '/app/';
        public appTitle: string = 'SharePoint Kanban';
        public projectSiteUrl: string = 'media';
        public projectListName: string = 'Projects';
        public serverHostname: string = '//' + window.location.hostname;
        public version: string = '0.0.1';

        constructor() {

        }
    }

    export var configModule: ng.IModule = angular.module('config', []);

    configModule.factory(Config.Id, [function () {
        return new Config();
    }]);

}

 