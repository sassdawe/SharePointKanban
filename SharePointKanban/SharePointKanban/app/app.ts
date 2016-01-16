/// <reference path="../scripts/typings/jquery.d.ts" />
/// <reference path="../scripts/typings/angular.d.ts" />
/// <reference path="../scripts/typings/angular-ui-router.d.ts" />
/// <reference path="../scripts/typings/angular-ui-bootstrap.d.ts" />
/// <reference path="../scripts/typings/angular-sanitize.d.ts" />
/// <reference path="../scripts/typings/moment/moment.d.ts" />
/// <reference path="../scripts/typings/q/q.d.ts" />
/// <reference path="../scripts/typings/toastr/toastr.d.ts" />


'use strict';
/**
 * SharePoint Kanban (Signboard) Angular Application
 * by John Bonfardeci <john.bonfardeci@gmail.com>
 * Created: December 2015
 * Modified:January 16,2016
 */
module App {

    export var app = angular.module("app", [
        // Angular modules 
        'ngSanitize',

        // Custom modules 
        'config',
        'common', // common functions

        // 3rd Party Modules
        'ui.bootstrap',
        'ui.router'
    ]);
   
}