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
        'ngSanitize',
        // Custom modules 
        'config',
        'common',
        'common.bootstrap',
        // 3rd Party Modules
        'ui.bootstrap',
        'ui.router'
    ]);
})(App || (App = {}));
var App;
(function (App) {
    var BootstrapDialog = (function () {
        function BootstrapDialog($modal, $templateCache) {
            this.$modal = $modal;
            this.$templateCache = $templateCache;
            this.setTemplate();
        }
        BootstrapDialog.prototype.deleteDialog = function (itemName) {
            var title = 'Confirm Delete';
            itemName = itemName || 'item';
            var msg = 'Delete ' + itemName + '?';
            return this.confirmationDialog(title, msg);
        };
        BootstrapDialog.prototype.confirmationDialog = function (title, msg, okText, cancelText) {
            var modalOptions = {
                templateUrl: 'modalDialog.tpl.html',
                controller: [
                    '$scope', '$modalInstance', 'options',
                    function ($s, $mI, o) { return new ModalCtrl($s, $mI, o); }],
                keyboard: true,
                resolve: {
                    options: function () {
                        return {
                            title: title,
                            message: msg,
                            okText: okText,
                            cancelText: cancelText
                        };
                    }
                }
            };
            return this.$modal.open(modalOptions).result;
        };
        BootstrapDialog.prototype.setTemplate = function () {
            this.$templateCache.put('modalDialog.tpl.html', '<div>' +
                '    <div class="modal-header">' +
                '        <button type="button" class="close" data-dismiss="modal" aria-hidden="true" data-ng-click="cancel()">&times;</button>' +
                '        <h3>{{title}}</h3>' +
                '    </div>' +
                '    <div class="modal-body">' +
                '        <p>{{message}}</p>' +
                '    </div>' +
                '    <div class="modal-footer">' +
                '        <button class="btn btn-primary" data-ng-click="ok()">{{okText}}</button>' +
                '        <button class="btn btn-info" data-ng-click="cancel()">{{cancelText}}</button>' +
                '    </div>' +
                '</div>');
        };
        BootstrapDialog.Id = 'bootstrap.dialog';
        BootstrapDialog.$inject = ['$modal', '$templateCache'];
        return BootstrapDialog;
    })();
    var ModalCtrl = (function () {
        function ModalCtrl($scope, $modalInstance, options) {
            $scope.title = options.title || 'Title';
            $scope.message = options.message || '';
            $scope.okText = options.okText || 'OK';
            $scope.cancelText = options.cancelText || 'Cancel';
            $scope.ok = function () { $modalInstance.close('ok'); };
            $scope.cancel = function () { $modalInstance.dismiss('cancel'); };
        }
        return ModalCtrl;
    })();
    // Register bootstrap.dialog service
    //#region explanation
    //-------STARTING COMMON MODULE----------
    // THIS CREATES THE ANGULAR CONTAINER NAMED 'common', A BAG THAT HOLDS SERVICES
    // CREATION OF A MODULE IS DONE USING ...module('moduleName', []) => retrieved using ...module.('...')
    // Contains services:
    //  - common
    //  - logger
    //  - spinner
    //#endregion
    App.bootstrapModule = angular.module('common.bootstrap', [])
        .factory(BootstrapDialog.Id, BootstrapDialog);
})(App || (App = {}));
var App;
(function (App) {
    var Common = (function () {
        function Common($q, $rootScope) {
            this.$rootScope = $rootScope;
            this.$q = $q;
            this.$loader = $('.ajax-loader');
        }
        Common.prototype.showLoader = function () {
            this.$loader.show();
        };
        Common.prototype.hideLoader = function () {
            this.$loader.hide();
        };
        Common.Id = "common";
        return Common;
    })();
    App.Common = Common;
    App.commonModule = angular.module('common', []);
    App.commonModule.factory(Common.Id, ['$q', '$rootScope', function ($q, $rootScope) {
            return new Common($q, $rootScope);
        }]);
})(App || (App = {}));
var App;
(function (App) {
    var Config = (function () {
        function Config() {
            this.debug = true;
            this.orgName = '';
            this.appPath = '/app/';
            this.appTitle = 'SharePoint Kanban';
            this.projectSiteUrl = 'media';
            this.projectListName = 'Projects';
            this.serverHostname = '//' + window.location.hostname;
            this.version = '0.0.1';
        }
        Config.Id = 'config';
        return Config;
    })();
    App.Config = Config;
    App.configModule = angular.module('config', []);
    App.configModule.factory(Config.Id, [function () {
            return new Config();
        }]);
})(App || (App = {}));
var App;
(function (App) {
    App.app.directive('kanbanTask', function () {
        return {
            restrict: 'A',
            scope: {
                kanbanTask: '=',
                column: '=',
                index: '=',
                parentScope: '='
            },
            link: function (scope, $element, attrs) {
                // Store in parent scope a reference to the task being dragged, 
                // its parent column array, and its index number.
                $element.on('dragstart', function (event) {
                    scope.parentScope.dragging = {
                        task: scope.kanbanTask,
                        index: scope.index,
                        col: scope.column
                    };
                });
            }
        };
    });
    App.app.directive('kanbanColumn', function () {
        return {
            restrict: 'A',
            scope: {
                kanbanColumn: '=',
                parentScope: '='
            },
            link: function (scope, $element, attrs) {
                // trigger the event handler when a task element is dropped over the Kanban column.
                $element.on('drop', function (event) {
                    cancel(event);
                    var result = scope.kanbanColumn.tasks.unshift(scope.parentScope.dragging.task);
                    // slice the task off the task list we moved it from
                    if (result > 0) {
                        App.Utils.remove(scope.parentScope.dragging.col.tasks, scope.parentScope.dragging.index);
                        $element.prepend(document.getElementById('task_' + scope.parentScope.dragging.task.Id));
                    }
                }).on('dragover', function (event) {
                    cancel(event);
                });
                // Cross-browser method to prevent the default event when dropping an element.
                function cancel(event) {
                    if (event.preventDefault) {
                        event.preventDefault();
                    }
                    if (event.stopPropagation) {
                        event.stopPropagation();
                    }
                    return false;
                }
            }
        };
    });
})(App || (App = {}));
var App;
(function (App) {
    var Dependencies = (function () {
        function Dependencies() {
        }
        Dependencies.projectList = ['datacontext', function (datacontext) {
                return datacontext.getTestData();
            }];
        return Dependencies;
    })();
    App.Dependencies = Dependencies;
})(App || (App = {}));
/**
* Central configuration of all application state routes via Angular UI Router
*
* Inject not only reusable dependencies but reusable views to assemble dashboards in any way necessary! Perfect Dependency Injection.
* 'DVR - Dependencies, Views, and Routes' - John Bonfardeci
*/
var App;
(function (App) {
    var Routes = (function () {
        function Routes($stateProvider, $urlRouterProvider) {
            // the default url if url doesn't match any of the Angular UI Router states
            $urlRouterProvider.otherwise('/');
            // Setup the Angular UI Router states
            $stateProvider.state('app', {
                // With abstract set to true, that means this state can not be explicitly activated.
                // It can only be implicitly activated by activating one of its children.
                abstract: true,
                // This abstract state will prepend '/' onto the urls of all its children.
                url: '/',
                // This is the top level state, so this template file will be loaded and then inserted into the ui-view within index.html.
                templateUrl: '/app/shell/shell.html',
                controller: App.Controllers.ShellController.Id,
                controllerAs: 'vm'
            });
            //////////////
            // Shell > Home
            //////////////
            // Using a '.' within a state name declares a child within a parent.
            // So you have a new state 'menu' within the parent 'cds' state.
            // You can have unlimited children within a state's `views` property!
            $stateProvider.state('app.home', {
                // use same url as parent - '/' + '' = '/'
                url: '',
                // If there is more than a single ui-view in the parent template, or you would
                // like to target a ui-view from even higher up the state tree, you can use the
                // views object to configure multiple views. Each view can get its own template,
                // controller, and resolve data.
                // View names can be relative or absolute. Relative view names do not use an '@'
                // symbol. They always refer to views within this state's parent template.
                // Absolute view names use a '@' symbol to distinguish the view and the state.
                // So 'foo@bar' means the ui-view named 'foo' within the 'bar' state's template.
                views: {
                    ////////////
                    // Main Menu
                    ////////////
                    // viewName@stateName
                    'menu@app': App.Views.menu,
                    ////////////
                    // Home
                    ////////////
                    'main@app': App.Views.home,
                    ////////////
                    // Footer
                    ////////////
                    'footer@app': App.Views.footer,
                    'kanban@app.home': App.Views.kanban
                }
            });
        }
        Routes.$inject = ['$stateProvider', '$urlRouterProvider'];
        return Routes;
    })();
    App.Routes = Routes;
    App.app.config(Routes);
})(App || (App = {}));
var App;
(function (App) {
    /**
    * Views
    *
    * Reusable Angular UI Router view modules
    * Declare all controller views here.
    */
    var Views = (function () {
        function Views() {
        }
        Views.ts = function () {
            return '?_=' + new Date().toISOString();
        };
        Views.menu = {
            templateUrl: '/app/menu/menu.html' + Views.ts(),
            controller: 'menuController',
            controllerAs: 'vm' // the alias of the Angular controller in the HTML templates; `vm` short for 'View Model'
        };
        Views.home = {
            templateUrl: '/app/home/home.html' + Views.ts(),
            controller: 'homeController',
            controllerAs: 'vm',
            resolve: {
                projects: App.Dependencies.projectList
            }
        };
        Views.footer = {
            templateUrl: '/app/footer/footer.html' + Views.ts(),
            controller: 'footerController',
            controllerAs: 'vm'
        };
        Views.kanban = {
            templateUrl: '/app/kanban/index.html' + Views.ts(),
            controller: 'kanbanController',
            controllerAs: 'vm'
        };
        return Views;
    })();
    App.Views = Views;
})(App || (App = {}));
var App;
(function (App) {
    App.app.filter('by_prop', function () {
        App.Utils.filterByProperty['$stateful'] = true; // enable function to wait on async data
        return App.Utils.filterByProperty;
    });
})(App || (App = {}));
var App;
(function (App) {
    var Controllers;
    (function (Controllers) {
        var FooterController = (function () {
            function FooterController(config) {
                this.config = config;
                this.copyright = '&copy; ' + config.orgName + ' ' + new Date().getFullYear();
            }
            FooterController.Id = 'footerController';
            FooterController.$inject = ['config'];
            return FooterController;
        })();
        Controllers.FooterController = FooterController;
        App.app.controller(FooterController.Id, FooterController);
    })(Controllers = App.Controllers || (App.Controllers = {}));
})(App || (App = {}));
var App;
(function (App) {
    var Controllers;
    (function (Controllers) {
        var HomeController = (function () {
            function HomeController(common, config, $stateParams, datacontext, projects) {
                this.common = common;
                this.config = config;
                this.$stateParams = $stateParams;
                this.datacontext = datacontext;
                this.dragging = {
                    task: null,
                    col: null,
                    index: null
                };
                this.projects = projects;
                this.updateColumns();
            }
            HomeController.prototype.updateColumns = function () {
                this.columns = [
                    {
                        title: 'Backlog',
                        id: 'backlog-tasks',
                        className: 'panel panel-info',
                        tasks: this.projects.filter(function (task) {
                            return task.Status.Value == 'Not Started';
                        })
                    },
                    {
                        title: 'In Progress',
                        id: 'in-progress-tasks',
                        className: 'panel panel-danger',
                        tasks: this.projects.filter(function (task) {
                            return task.Status.Value == 'In Progress';
                        })
                    },
                    {
                        title: 'Testing',
                        id: 'testing-tasks',
                        className: 'panel panel-warning',
                        tasks: this.projects.filter(function (task) {
                            return task.Status.Value == 'Testing';
                        })
                    },
                    {
                        title: 'Done',
                        id: 'completed-tasks',
                        className: 'panel panel-success',
                        tasks: this.projects.filter(function (task) {
                            return task.Status.Value == 'Completed';
                        })
                    }
                ];
            };
            HomeController.prototype.refreshBoard = function () {
                var self = this;
                this.datacontext.getTestData().then(function (projects) {
                    self.projects = projects;
                    self.updateColumns();
                });
            };
            HomeController.Id = "homeController";
            HomeController.$inject = ['common', 'config', '$stateParams', 'datacontext', 'projects'];
            return HomeController;
        })();
        Controllers.HomeController = HomeController;
        App.app.controller(HomeController.Id, HomeController);
    })(Controllers = App.Controllers || (App.Controllers = {}));
})(App || (App = {}));
var App;
(function (App) {
    var Controllers;
    (function (Controllers) {
        var KanbanController = (function () {
            function KanbanController($scope) {
                this.dragging = {};
                this.$scope = $scope;
                this.columns = $scope.$parent.vm.columns;
                this.dragging = $scope.$parent.vm.dragging;
            }
            KanbanController.Id = 'kanbanController';
            KanbanController.$inject = ['$scope'];
            return KanbanController;
        })();
        Controllers.KanbanController = KanbanController;
        App.app.controller(KanbanController.Id, KanbanController);
    })(Controllers = App.Controllers || (App.Controllers = {}));
})(App || (App = {}));
var App;
(function (App) {
    var Controllers;
    (function (Controllers) {
        var MenuController = (function () {
            function MenuController(config, $state, $stateParams) {
                this.config = config;
                this.$state = $state;
                this.$stateParams = $stateParams;
                this.appTitle = config.appTitle;
            }
            MenuController.Id = 'menuController';
            MenuController.$inject = ['config', '$state', '$stateParams'];
            return MenuController;
        })();
        Controllers.MenuController = MenuController;
        App.app.controller(MenuController.Id, MenuController);
    })(Controllers = App.Controllers || (App.Controllers = {}));
})(App || (App = {}));
var App;
(function (App) {
    App.app.run(['$rootScope', '$state', '$stateParams', function run($rootScope, $state, $stateParams) {
            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;
            // jumpstart the routes
            $state.go('app.home');
        }]);
})(App || (App = {}));
var App;
(function (App) {
    var Services;
    (function (Services) {
        var Datacontext = (function () {
            function Datacontext($http, $q, common, config) {
                this.$http = $http;
                this.$q = $q;
                this.common = common;
                this.config = config;
            }
            /**
            * Get list item via REST services.
            * @param uri: string
            * @param done: JQueryPromiseCallback<any>
            * @param fail?: JQueryPromiseCallback<any> = undefined
            * @param always?: JQueryPromiseCallback<any> = undefined
            * @return void
            */
            Datacontext.prototype.getSpListItems = function (siteUrl, listName, filter, select, orderby, expand, top) {
                if (filter === void 0) { filter = null; }
                if (select === void 0) { select = null; }
                if (orderby === void 0) { orderby = null; }
                if (expand === void 0) { expand = null; }
                if (top === void 0) { top = 10; }
                var self = this;
                var deferred = this.$q.defer();
                this.common.showLoader();
                var url = [siteUrl + '/_vti_bin/listdata.svc/' + App.SharePoint.Utils.toCamelCase(listName)];
                if (!!filter) {
                    url.push('$filter=' + filter);
                }
                if (!!select) {
                    url.push('$select=' + select);
                }
                if (!!orderby) {
                    url.push('$orderby=' + orderby);
                }
                if (!!expand) {
                    url.push('$expand=' + expand);
                }
                url.push('$top=' + top);
                self.$http({
                    url: url.join('&').replace(/\&/, '\?'),
                    method: 'GET',
                    headers: { 'Accept': 'application/json;odata=verbose' }
                }).then(function (response) {
                    deferred.resolve(response.data.d.results);
                }).finally(function () {
                    self.common.hideLoader();
                });
                return deferred.promise;
            };
            Datacontext.prototype.getProjects = function () {
                return this.getSpListItems(this.config.projectSiteUrl, this.config.projectListName, null, null, 'Created desc', 'AssignedTo,Attachments,CreatedBy,ModifiedBy,Priority,Status', 100);
            };
            Datacontext.prototype.getTestData = function () {
                var d = this.$q.defer();
                var self = this;
                self.$http({
                    url: '/testdata.txt',
                    method: 'GET'
                }).then(function (response) {
                    if (response.status != 200) {
                        d.resolve(null);
                        d.reject(response.statusText);
                        return;
                    }
                    d.resolve(response.data.d.results);
                }).finally(function () {
                    self.common.hideLoader();
                });
                return d.promise;
            };
            Datacontext.Id = 'datacontext';
            return Datacontext;
        })();
        Services.Datacontext = Datacontext;
        // Register with angular
        App.app.factory(Datacontext.Id, ['$http', '$q', 'common', 'config', function factory($http, $q, common, config) {
                return new Datacontext($http, $q, common, config);
            }]);
    })(Services = App.Services || (App.Services = {}));
})(App || (App = {}));
var App;
(function (App) {
    var SharePoint;
    (function (SharePoint) {
        // recreate the SP REST object for an attachment
        var SpAttachment = (function () {
            function SpAttachment(rootUrl, siteUrl, listName, itemId, fileName) {
                var entitySet = listName.replace(/\s/g, '');
                siteUrl = SharePoint.Utils.formatSubsiteUrl(siteUrl);
                var uri = rootUrl + siteUrl + "_vti_bin/listdata.svc/Attachments(EntitySet='{0}',ItemId={1},Name='{2}')";
                uri = uri.replace(/\{0\}/, entitySet).replace(/\{1\}/, itemId + '').replace(/\{2\}/, fileName);
                this.__metadata = {
                    uri: uri,
                    content_type: "application/octetstream",
                    edit_media: uri + "/$value",
                    media_etag: null,
                    media_src: rootUrl + siteUrl + "/Lists/" + listName + "/Attachments/" + itemId + "/" + fileName,
                    type: "Microsoft.SharePoint.DataService.AttachmentsItem"
                };
                this.EntitySet = entitySet;
                this.ItemId = itemId;
                this.Name = fileName;
            }
            return SpAttachment;
        })();
        SharePoint.SpAttachment = SpAttachment;
        var SpItem = (function () {
            function SpItem() {
            }
            return SpItem;
        })();
        SharePoint.SpItem = SpItem;
    })(SharePoint = App.SharePoint || (App.SharePoint = {}));
})(App || (App = {}));
var App;
(function (App) {
    var SharePoint;
    (function (SharePoint) {
        var Utils = (function () {
            function Utils() {
            }
            /**
            * Ensure site url is or ends with '/'
            * @param url: string
            * @return string
            */
            Utils.formatSubsiteUrl = function (url) {
                return !!!url ? '/' : !/\/$/.test(url) ? url + '/' : url;
            };
            /**
            * Convert a name to REST camel case format
            * @param str: string
            * @return string
            */
            Utils.toCamelCase = function (str) {
                return str.toString()
                    .replace(/\s*\b\w/g, function (x) {
                    return (x[1] || x[0]).toUpperCase();
                }).replace(/\s/g, '')
                    .replace(/\'s/, 'S')
                    .replace(/[^A-Za-z0-9\s]/g, '');
            };
            /**
            * Escape column values
            * http://dracoblue.net/dev/encodedecode-special-xml-characters-in-javascript/155/
            */
            Utils.escapeColumnValue = function (s) {
                if (typeof s === "string") {
                    return s.replace(/&(?![a-zA-Z]{1,8};)/g, "&amp;");
                }
                else {
                    return s;
                }
            };
            return Utils;
        })();
        SharePoint.Utils = Utils;
    })(SharePoint = App.SharePoint || (App.SharePoint = {}));
})(App || (App = {}));
var App;
(function (App) {
    var Controllers;
    (function (Controllers) {
        var ShellController = (function () {
            function ShellController($rootScope) {
                this.$rootScope = $rootScope;
            }
            ShellController.Id = 'shellController';
            ShellController.$inject = ['$rootScope'];
            return ShellController;
        })();
        Controllers.ShellController = ShellController;
        // Register with angular
        App.app.controller(ShellController.Id, ShellController);
    })(Controllers = App.Controllers || (App.Controllers = {}));
})(App || (App = {}));
var App;
(function (App) {
    var Utils = (function () {
        function Utils() {
        }
        Utils.getTimestamp = function () {
            return '?_=' + new Date().toISOString();
        };
        /**
        * Parse dates in format: "MM/DD/YYYY", "MM-DD-YYYY", "YYYY-MM-DD", "/Date(1442769001000)/", or YYYY-MM-DDTHH:MM:SSZ
        * @param val: string
        * @return Date
        */
        Utils.parseDate = function (val) {
            if (!!!val) {
                return null;
            }
            if (typeof val == 'object' && val.constructor == Date) {
                return val;
            }
            var rxSlash = /\d{1,2}\/\d{1,2}\/\d{2,4}/, rxHyphen = /\d{1,2}-\d{1,2}-\d{2,4}/, rxIsoDate = /\d{4}-\d{1,2}-\d{1,2}/, rxTicks = /(\/|)\d{13}(\/|)/, rxIsoDateTime = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, tmp, m, d, y, time, date = null;
            val = rxIsoDate.test(val) ? val : (val + '').replace(/[^0-9\/\-]/g, '');
            if (val == '') {
                return null;
            }
            if (rxSlash.test(val) || rxHyphen.test(val)) {
                tmp = rxSlash.test(val) ? val.split('/') : val.split('-');
                m = parseInt(tmp[0]) - 1;
                d = parseInt(tmp[1]);
                y = parseInt(tmp[2]);
                y = y < 100 ? 2000 + y : y;
                date = new Date(y, m, d, 0, 0, 0, 0);
            }
            else if (rxIsoDate.test(val) || rxIsoDateTime.test(val)) {
                tmp = val.split('-');
                y = parseInt(tmp[0]);
                m = parseInt(tmp[1]) - 1;
                d = parseInt(tmp[2]);
                y = y < 100 ? 2000 + y : y;
                if (/T/.test(val)) {
                    time = val.split('T')[1].split(':');
                    date = new Date(y, m, d, ~~time[0], ~~time[1], ~~time[2]);
                }
                else {
                    date = new Date(y, m, d, 0, 0, 0);
                }
            }
            else if (rxTicks.test(val)) {
                date = new Date(parseInt(val.replace(/\D/g, '')));
            }
            return date;
        };
        /**
        * Filter by Property Value
        * The default Angular `filter` filter throws 'too much recursion' error when filtering a Breeze entity with relationships.
        * This is just a simple filter for a shallow property value search.
        * <p>
        * usage: <div ng-repeat="eb in vm.employeeBenefitItems | by_prop : svc.ServiceId"></div>
        *
        * @param entities Array<any>
        * @return Array<any>
        */
        Utils.filterByProperty = function (entities, val) {
            if (!!!entities) {
                return [];
            }
            var filtered = [];
            entities.forEach(function (entity) {
                for (var prop in entity) {
                    if (entity[prop] == val) {
                        filtered.push(entity);
                    }
                }
            });
            return filtered;
        };
        /**
        * Find and return unique values from an array.
        *
        * @param inputArray:Array
        * @return Array
        */
        Utils.getUniqueKeyValues = function (inputArray, keyName) {
            var outputArray = [];
            for (var i = 0; i < inputArray.length; i++) {
                var val = inputArray[i][keyName];
                if (outputArray.indexOf(val) > -1) {
                    continue;
                }
                outputArray.push(val);
            }
            return outputArray.sort();
        };
        Utils.remove = function (a, from, to) {
            if (to === void 0) { to = undefined; }
            var rest = a.slice((to || from) + 1 || a.length);
            a.length = from < 0 ? a.length + from : from;
            return a.push.apply(a, rest);
        };
        return Utils;
    })();
    App.Utils = Utils;
})(App || (App = {}));
//# sourceMappingURL=app.js.map