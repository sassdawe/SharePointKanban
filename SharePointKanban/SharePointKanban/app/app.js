/// <reference path="../scripts/typings/jquery.d.ts" />
/// <reference path="../scripts/typings/angular.d.ts" />
/// <reference path="../scripts/typings/angular-ui-router.d.ts" />
/// <reference path="../scripts/typings/angular-ui-bootstrap.d.ts" />
/// <reference path="../scripts/typings/angular-sanitize.d.ts" />
'use strict';
var App;
(function (App) {
    App.app = angular.module("app", [
        // Angular modules 
        'ngAnimate',
        'ngSanitize',
        // Custom modules 
        'common',
        'common.bootstrap',
        // 3rd Party Modules
        'ngAria',
        'ui.bootstrap',
        'ui.router'
    ]);
})(App || (App = {}));
//# sourceMappingURL=app.js.map