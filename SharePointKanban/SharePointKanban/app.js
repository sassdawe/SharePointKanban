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
            this.appPath = 'app/';
            this.orgName = '';
            this.projectSiteUrl = '/media';
            this.projectListName = 'Projects';
            this.productionHostname = 'webster';
            this.serverHostname = '//' + window.location.hostname;
            this.appTitle = 'Dev Projects Kanban';
            this.version = '0.0.1';
            this.isProduction = !!(window.location.hostname.indexOf(this.productionHostname) > -1);
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
                parentScope: '='
            },
            link: function (scope, $element, attrs) {
                // Store in parent scope a reference to the task being dragged, 
                // its parent column array, and its index number.
                $element.on('dragstart', function (event) {
                    scope.parentScope.dragging = {
                        task: scope.kanbanTask,
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
                    scope.parentScope.updateTaskStatus(scope.parentScope.dragging.task.Id, scope.kanbanColumn.status);
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
                return datacontext.getProjects();
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
                templateUrl: 'app/shell/shell.htm',
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
                    'footer@app': App.Views.footer
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
            return '?_=' + new Date().getTime();
        };
        Views.menu = {
            templateUrl: 'app/menu/menu.htm' + Views.ts(),
            controller: 'menuController',
            controllerAs: 'vm' // the alias of the Angular controller in the HTML templates; `vm` short for 'View Model'
        };
        Views.home = {
            templateUrl: 'app/home/home.htm' + Views.ts(),
            controller: 'homeController',
            controllerAs: 'vm',
            resolve: {
                projects: App.Dependencies.projectList
            }
        };
        Views.footer = {
            templateUrl: 'app/footer/footer.htm' + Views.ts(),
            controller: 'footerController',
            controllerAs: 'vm'
        };
        Views.kanban = {
            templateUrl: 'app/kanban/index.htm' + Views.ts(),
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
    App.app.filter('sp_date', function () {
        App.Utils.filterByProperty['$stateful'] = true; // enable function to wait on async data
        return App.Utils.parseDate;
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
            function HomeController($scope, common, config, $stateParams, datacontext, projects) {
                this.$scope = $scope;
                this.common = common;
                this.config = config;
                this.$stateParams = $stateParams;
                this.datacontext = datacontext;
                this.projects = projects;
                // used by directive, `kanbanColumn`, to reference the current task being dragged over it.
                this.dragging = {
                    task: null
                };
                this.changeQueue = [];
                this.$scope = $scope;
                this.projects = projects;
                this.pristineProjectsData = App.Utils.clone(this.projects);
                this.updateColumns();
            }
            HomeController.prototype.saveChanges = function () {
                if (!confirm('Are you sure you want to save changes to ' + this.changeQueue.length + ' projects?')) {
                    return false;
                }
                var self = this;
                // update the list item on the server
                this.datacontext.updateSoapListItems(this.changeQueue, this.config.projectSiteUrl, this.config.projectListName).then(function (response) {
                    //console.info(response);
                    //console.info('updated task ' + this.projects[i].Id + ' to ' + status);
                    var xmlDoc = response.data;
                    if (!!xmlDoc) {
                        //<ErrorCode>0x00000000</ErrorCode>
                        //var $errorNode = $(xmlDoc).find('ErrorCode');
                        //if ($errorNode.text() != '0x00000000') {
                        //    // report error message
                        //    console.warn($errorNode.text());
                        //    return;
                        //}
                        console.info($(xmlDoc).find('UpdateListItemsResult'));
                        console.info('Saved ' + self.changeQueue.length + ' changes.');
                        self.changeQueue = [];
                    }
                });
                return false;
            };
            HomeController.prototype.resetData = function () {
                this.projects = [];
                this.projects = App.Utils.clone(this.pristineProjectsData);
                this.updateColumns();
                this.changeQueue = [];
                return false;
            };
            HomeController.prototype.updateTaskStatus = function (taskId, status) {
                for (var i = 0; i < this.projects.length; i++) {
                    if (this.projects[i].Id == taskId) {
                        this.projects[i].Status.Value = status;
                        this.changeQueue.push({
                            Id: taskId,
                            fields: [{ name: 'Status', value: status }]
                        });
                        this.updateColumns(true);
                        return i;
                    }
                }
                return -1;
            };
            HomeController.prototype.updateColumns = function (apply) {
                if (apply === void 0) { apply = false; }
                this.columns = [
                    {
                        title: 'Backlog',
                        id: 'backlog-tasks',
                        className: 'panel panel-info',
                        status: 'Not Started',
                        tasks: this.projects.filter(function (task) {
                            return task.Status.Value == 'Not Started';
                        })
                    },
                    {
                        title: 'In Progress',
                        id: 'in-progress-tasks',
                        className: 'panel panel-danger',
                        status: 'In Progress',
                        tasks: this.projects.filter(function (task) {
                            return task.Status.Value == 'In Progress';
                        })
                    },
                    {
                        title: 'Testing',
                        id: 'testing-tasks',
                        className: 'panel panel-warning',
                        status: 'Testing',
                        tasks: this.projects.filter(function (task) {
                            return task.Status.Value == 'Testing';
                        })
                    },
                    {
                        title: 'Done',
                        id: 'completed-tasks',
                        className: 'panel panel-success',
                        status: 'Completed',
                        tasks: this.projects.filter(function (task) {
                            return task.Status.Value == 'Completed';
                        })
                    }
                ];
                if (apply) {
                    this.$scope.$apply();
                }
            };
            HomeController.prototype.deleteTask = function (task, index) {
                var self = this;
                if (!confirm('Are you sure you want to delete the project with ID# ' + task.Id + '?')) {
                    return;
                }
                this.datacontext.deleteListItem(task).then(function (response) {
                    App.Utils.remove(self.projects, index);
                    self.updateColumns(true);
                });
                return false;
            };
            HomeController.prototype.refreshData = function () {
                var self = this;
                this.datacontext.getProjects().then(function (projects) {
                    self.projects = projects;
                    self.updateColumns();
                });
                return false;
            };
            HomeController.prototype.viewItem = function (task) {
                var self = this;
                var itemUrl = this.config.projectSiteUrl + '/Lists/' + this.config.projectListName.replace(/\s/g, '%20') + '/DispForm.aspx?ID=' + task.Id;
                //console.info(itemUrl);
                //return false;
                App.SharePoint.Utils.openSPForm(itemUrl, task.Title, function (result, target) {
                });
                return false;
            };
            HomeController.Id = "homeController";
            HomeController.$inject = ['$scope', 'common', 'config', '$stateParams', 'datacontext', 'projects'];
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
            * Execute a REST request.
            * @param url: string
            * @param method?: string = 'GET'
            * @param headers?: Object = undefined
            * @return IPromise<any>
            */
            Datacontext.prototype.executeRestRequest = function (url, data, cache, method, headers) {
                if (data === void 0) { data = undefined; }
                if (cache === void 0) { cache = false; }
                if (method === void 0) { method = 'GET'; }
                if (headers === void 0) { headers = undefined; }
                var self = this;
                var d = this.$q.defer();
                this.common.showLoader();
                var params = {
                    url: url,
                    method: method,
                    cache: cache,
                    headers: { 'Accept': 'application/json;odata=verbose' }
                };
                if (!!data) {
                    params['data'] = data;
                }
                if (!!headers) {
                    for (var p in params.headers) {
                        params.headers[p] = headers[p];
                    }
                }
                self.$http(params).then(function (response) {
                    d.resolve(response);
                }).finally(function () {
                    self.common.hideLoader();
                });
                return d.promise;
            };
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
                var d = this.$q.defer();
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
                this.executeRestRequest(url.join('&').replace(/\&/, '\?')).then(function (response) {
                    d.resolve(response.data.d.results);
                });
                return d.promise;
            };
            Datacontext.prototype.getProjects = function (prevMonths) {
                if (prevMonths === void 0) { prevMonths = 12; }
                if (!this.config.isProduction) {
                    return this.getTestData();
                }
                var today = new Date();
                var dateFilter = new Date(today.getFullYear(), (today.getMonth() - prevMonths), today.getDate(), 0, 0, 0).toISOString();
                var filter = 'CategoryValue eq \'Project\' and Created gt datetime\'' + dateFilter + '\'';
                var select = 'Id,Title,AssignedTo,Attachments,Priority,Status,StartDate,EndDueDate';
                var orderBy = 'PriorityValue desc,Created asc';
                var expand = 'AssignedTo,Attachments,Priority,Status';
                return this.getSpListItems(this.config.projectSiteUrl, this.config.projectListName, filter, select, orderBy, expand, 100);
            };
            Datacontext.prototype.getProject = function (siteUrl, listName, itemId) {
                return this.executeRestRequest(siteUrl + '/_vti_bin/listdata.svc/' + App.SharePoint.Utils.toCamelCase(listName) + '(' + itemId + ')');
            };
            Datacontext.prototype.insertListItem = function (url, data) {
                if (data === void 0) { data = undefined; }
                return this.executeRestRequest(url, data, false, 'POST');
            };
            Datacontext.prototype.updateListItem = function (item, data) {
                if (data === void 0) { data = undefined; }
                var headers = {
                    'Accept': 'application/json;odata=verbose',
                    'X-HTTP-Method': 'MERGE',
                    'If-Match': item.__metadata.etag
                };
                return this.executeRestRequest(item.__metadata.uri, data, false, 'POST', headers);
            };
            /**
            * Delete the list item.
            * @param model: IViewModel
            * @param callback?: Function = undefined
            * @return IPromise<any>
            */
            Datacontext.prototype.deleteListItem = function (item) {
                var headers = {
                    'Accept': 'application/json;odata=verbose',
                    'X-Http-Method': 'DELETE',
                    'If-Match': item.__metadata.etag
                };
                return this.executeRestRequest(item.__metadata.uri, null, false, 'POST', headers);
            };
            /**
            * Delete an attachment.
            * @param att: SharePoint.ISpAttachment
            * @return IPromise<any>
            */
            Datacontext.prototype.deleteAttachment = function (att) {
                var headers = {
                    'Accept': 'application/json;odata=verbose',
                    'X-HTTP-Method': 'DELETE'
                };
                return this.executeRestRequest(att.__metadata.uri, null, false, 'POST', headers);
            };
            /**
            * Execute SOAP Request
            * @param action: string
            * @param packet: string
            * @param params: Array<any>
            * @param siteUrl?: string = ''
            * @param cache: boolean? = false
            * @param service?: string = 'lists.asmx'
            * @return IPromise<any>
            */
            Datacontext.prototype.executeSoapRequest = function (action, packet, data, siteUrl, cache, headers, service) {
                if (siteUrl === void 0) { siteUrl = ''; }
                if (cache === void 0) { cache = false; }
                if (headers === void 0) { headers = undefined; }
                if (service === void 0) { service = 'lists.asmx'; }
                var d = this.$q.defer();
                var self = this;
                this.common.showLoader();
                var serviceUrl = siteUrl + '/_vti_bin/' + service;
                if (!!data) {
                    for (var i = 0; i < data.length; i++) {
                        packet = packet.replace('{' + i + '}', (data[i] == null ? '' : data[i]));
                    }
                }
                var params = {
                    url: serviceUrl,
                    data: packet,
                    method: 'POST',
                    cache: cache,
                    headers: {
                        'Content-Type': 'text/xml; charset=utf-8',
                        'SOAPAction': action
                    }
                };
                if (!!headers) {
                    for (var p in headers) {
                        params.headers[p] = headers[p];
                    }
                }
                this.$http(params).then(function (response) {
                    d.resolve(response);
                }).finally(function () {
                    self.common.hideLoader();
                });
                return d.promise;
            };
            /**
            * Update batch of list items via SOAP services.
            * @param listName: string
            * @param fields: Array<Array<any>>
            * @param isNew?: boolean = true
            * param callback?: Function = undefined
            * @param self: SPForm = undefined
            * @return void
            */
            Datacontext.prototype.updateSoapListItems = function (fields, siteUrl, listName) {
                if (!this.config.isProduction) {
                    var d = this.$q.defer();
                    d.resolve({
                        status: 200,
                        statusText: 'OK'
                    });
                    return d.promise;
                }
                var action = 'http://schemas.microsoft.com/sharepoint/soap/UpdateListItems';
                var packet = '<?xml version="1.0" encoding="utf-8"?>' +
                    '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
                    '<soap:Body>' +
                    '<UpdateListItems xmlns="http://schemas.microsoft.com/sharepoint/soap/">' +
                    '<listName>{0}</listName>' +
                    '<updates>{1}</updates>' +
                    '</UpdateListItems>' +
                    '</soap:Body>' +
                    '</soap:Envelope>';
                var batch = ["<Batch OnError='Continue'>"];
                for (var i = 0; i < fields.length; i++) {
                    batch.push("<Method ID='1' Cmd='Update'>");
                    for (var j = 0; j < fields[i].fields.length; j++) {
                        batch.push("<Field Name='" + fields[i].fields[j].name + "'>" + App.SharePoint.Utils.escapeColumnValue(fields[i].fields[j].value) + "</Field>");
                    }
                    batch.push("<Field Name='ID'>" + fields[i].Id + "</Field>");
                    batch.push("</Method>");
                }
                batch.push("</Batch>");
                packet = packet.replace(/\{0\}/, listName).replace(/\{1\}/, batch.join());
                return this.executeSoapRequest(action, packet, null, siteUrl);
            };
            Datacontext.prototype.getSoapListItems = function (siteUrl, listName, viewFields, query, rowLimit) {
                if (rowLimit === void 0) { rowLimit = 25; }
                var packet = '<?xml version="1.0" encoding="utf-8"?>' +
                    '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
                    '<soap:Body>' +
                    '<GetListItems xmlns="http://schemas.microsoft.com/sharepoint/soap/">' +
                    '<listName>' + listName + '</listName>' +
                    '<query>' + query + '</query>' +
                    '<viewFields>' + viewFields + '</viewFields>' +
                    '<rowLimit>' + rowLimit + '</rowLimit>' +
                    '</GetListItems>' +
                    '</soap:Body>' +
                    '</soap:Envelope>';
                return this.executeSoapRequest('http://schemas.microsoft.com/sharepoint/soap/GetListItems', packet, null, siteUrl);
            };
            Datacontext.prototype.searchPrincipals = function (term, maxResults, principalType) {
                if (maxResults === void 0) { maxResults = 10; }
                if (principalType === void 0) { principalType = 'User'; }
                var d = this.$q.defer();
                var action = 'http://schemas.microsoft.com/sharepoint/soap/SearchPrincipals';
                var params = [term, maxResults, principalType];
                var packet = '<?xml version="1.0" encoding="utf-8"?>' +
                    '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
                    '<soap:Body>' +
                    '<SearchPrincipals xmlns="http://schemas.microsoft.com/sharepoint/soap/">' +
                    '<searchText>{0}</searchText>' +
                    '<maxResults>{1}</maxResults>' +
                    '<principalType>{2}</principalType>' +
                    '</SearchPrincipals>' +
                    '</soap:Body>' +
                    '</soap:Envelope>';
                this.executeSoapRequest(action, packet, params, '', true, null, 'People.asmx').then(function (response) {
                    var xmlDoc = response.data;
                    var results = [];
                    $(xmlDoc).find('PrincipalInfo').each(function (i, n) {
                        results.push({
                            AccountName: $('AccountName', n).text(),
                            UserInfoID: parseInt($('UserInfoID', n).text()),
                            DisplayName: $('DisplayName', n).text(),
                            Email: $('Email', n).text(),
                            Title: $('Title', n).text(),
                            IsResolved: $('IsResolved', n).text() == 'true' ? !0 : !1,
                            PrincipalType: $('PrincipalType', n).text()
                        });
                    });
                    d.resolve(results);
                });
                return d.promise;
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
            Utils.openSPForm = function (url, title, callback, width, height) {
                if (title === void 0) { title = "Project Item"; }
                if (callback === void 0) { callback = function () { }; }
                if (width === void 0) { width = 300; }
                if (height === void 0) { height = 400; }
                var ex = window["ExecuteOrDelayUntilScriptLoaded"];
                var SP = window["SP"];
                ex(function () {
                    SP.UI.ModalDialog.showModalDialog({
                        title: title,
                        showClose: true,
                        url: url,
                        dialogReturnValueCallback: callback
                    });
                }, "sp.js");
                return false;
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
            return '?_=' + new Date().getTime();
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
        // https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/The_structured_clone_algorithm
        Utils.clone = function (objectToBeCloned) {
            // Basis.
            if (!(objectToBeCloned instanceof Object)) {
                return objectToBeCloned;
            }
            var objectClone;
            // Filter out special objects.
            var Constructor = objectToBeCloned.constructor;
            switch (Constructor) {
                // Implement other special objects here.
                case RegExp:
                    objectClone = new Constructor(objectToBeCloned);
                    break;
                case Date:
                    objectClone = new Constructor(objectToBeCloned.getTime());
                    break;
                default:
                    objectClone = new Constructor();
            }
            // Clone each property.
            for (var prop in objectToBeCloned) {
                objectClone[prop] = Utils.clone(objectToBeCloned[prop]);
            }
            return objectClone;
        };
        return Utils;
    })();
    App.Utils = Utils;
})(App || (App = {}));
