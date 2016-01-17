
module App {

    export interface IConfiguration {
        debug: boolean;
        appPath: string;
        appTitle: string;
        editGroups: Array<string>;
        isProduction: boolean;
        orgName: string;
        priorities: Array<string>;
        productionHostname: string;
        serverHostname: string;
        testUser: SharePoint.ISpUser;
        version: string;
    }

    /**
     * Setup your SharePoint host application configurations here and in /app/dvr/views.ts
     */
    export class Config implements IConfiguration {

        static Id: string = 'config';

        public debug: boolean = false;
        public appPath: string = 'app/'; //path to Angular app template files
        public appTitle: string = 'Dev Projects Kanban'; //display title of the app
        // list of SharePoint group names allowed to save changes
        public editGroups: Array<string> = ['Developers', 'Testers', 'Managers'];
        public isProduction: boolean; //if this isn't the production site, get test data
        public orgName: string = ''; //the name of your organization, shown in Copyright
        public productionHostname: string = 'mysite'; //the hostname of the live production SharePoint site
        public priorities: Array<string> = ['(1) High', '(2) Normal', '(3) Low'];     
        public serverHostname: string = '//' + window.location.hostname;
        public testUser: SharePoint.ISpUser = {
            Account: null,
            Department: 'Vogon Affairs',
            EMail: 'hitchiker@galaxy.org',
            Groups: [{id: 42, name: 'testers'}],
            ID: 42,
            JobTitle: 'Tester',
            Name: 'domain\marvin',
            Office: 'Heart of Gold',
            Title: 'Paranoid Android',
            UserName: 'marvin'
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

 