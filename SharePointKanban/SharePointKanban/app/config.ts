
module App {

    export interface IConfiguration {
        debug: boolean;
        appPath: string;
        appTitle: string;
        editGroups: Array<string>;
        isProduction: boolean;
        orgName: string;
        previousMonths: number;
        projectSiteUrl: string;
        projectListName: string;
        productionHostname: string;
        serverHostname: string;
        testUser: SharePoint.ISpUser;
        version: string;
    }

    export class Config implements IConfiguration {

        static Id: string = 'config';

        public debug: boolean = true;
        public appPath: string = 'app/'; //path to Angular app template files
        public appTitle: string = 'Dev Projects Kanban'; //display title of the app
        public editGroups: Array<string> = ['Webster Owners', 'testers', 'Corporate Operations Manager', 'Corporate Executive Management']; // list of SharePoint group names who's members are allowed to edit 
        public isProduction: boolean; //if this isn't the production site, get test data
        public orgName: string = ''; //the name of your organization, shown in Copyright
        public previousMonths: number = 18; //how far back to show project tasks
        public projectSiteUrl: string = '/media'; //the SharePoint subsite relative URL
        public projectListName: string = 'Projects'; //the SharePoint list name
        public productionHostname: string = 'webster'; //the hostname of the live production SharePoint site 
        public serverHostname: string = '//' + window.location.hostname;
        public testUser: SharePoint.ISpUser = {
            Account: null,
            Department: 'Vogon Affairs',
            EMail: 'hitchiker@galaxy.org',
            Groups: [{id: 42, name: 'testers'}],
            ID: 42,
            JobTitle: 'Tester',
            Name: 'domain\testadmin',
            Office: 'Some Office',
            Title: 'Test Admin',
            UserName: 'testadmin'
        };
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

 