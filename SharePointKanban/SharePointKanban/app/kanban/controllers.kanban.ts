
module App.Controllers{

    export interface IKanbanController {
        updateTask(taskId: number, field: ISpUpdateField): number;
        dragging: any;
    }

    export class KanbanController implements IKanbanController {

        static Id = 'kanbanController';

        static $inject = ['$scope', 'common', 'config', '$stateParams', 'datacontext', 'kanbanConfig'];

        private changeQueue: Array<ISpUpdateItem>;
        private pristineProjectsData: Array<SharePoint.ISpTaskItem>;
        private priorities: Array<string>;
        private currentUser: SharePoint.ISpUser;
        private $parent: Controllers.IShellController;
        private projects: Array<SharePoint.ISpTaskItem> = [];
        private userIsEditor: boolean;
        private now: Date;
        private statuses: Array<string>;
        private columns: Array<IKanbanColumn>;
        private siteUrl: string;
        private listName: string;
        private keywordFilter: string;

        // used by directive, `kanbanColumn`, to reference the current task being dragged over it.
        public dragging: any = {
            task: null
        }

        constructor(
            private $scope: any,
            private common: ICommon,
            private config: IConfiguration,
            private $stateParams: IAppStateParams,
            private datacontext: Services.IDatacontext,
            private kanbanConfig: IKanbanConfig) {

            this.siteUrl = kanbanConfig.siteUrl;
            this.listName = kanbanConfig.listName;
            this.columns = kanbanConfig.columns;
            this.statuses = kanbanConfig.statuses;
            this.priorities = this.config.priorities;
            this.$parent = this.$scope.$parent.shell;
            this.changeQueue = [];      
            this.currentUser = this.$parent.currentUser;
            this.userIsEditor = Utils.userIsEditor(this.currentUser, this.config.editGroups);
            this.now = new Date();
            this.refreshData();

            document.getElementById('keywordFilter').focus();
        }

        private saveChanges(): boolean {

            if (!confirm('Are you sure you want to save changes to ' + this.changeQueue.length + ' items?')) { return false; }

            var self = this;

            // update the list item on the server
            this.datacontext.updateSoapListItems(this.changeQueue, this.siteUrl, this.listName).then(
                (response: ng.IHttpPromiseCallbackArg<any>): void => {
                    var xmlDoc = response.data;

                    if (!!xmlDoc) {
                        //<ErrorCode>0x00000000</ErrorCode>
                        //var $errorNode = $(xmlDoc).find('ErrorCode');
                        //if ($errorNode.text() != '0x00000000') {
                        //    // report error message
                        //    console.warn($errorNode.text());
                        //    return;
                        //}

                        //console.info($(xmlDoc).find('UpdateListItemsResult'));

                        //console.info('Saved ' + self.changeQueue.length + ' changes.');
                        self.changeQueue = [];
                    }
                });

            return false;
        }

        private resetData(): boolean {
            this.projects = [];
            this.projects = angular.copy(this.pristineProjectsData, this.projects);
            this.updateColumns();
            this.changeQueue = [];
            return false;
        }

        public updateTask(taskId: number, field: ISpUpdateField, index: number = undefined): number {
            var self = this;
            for (var i = 0; i < this.projects.length; i++) {
                if (this.projects[i].Id != taskId) { continue; }

                var task: SharePoint.ISpTaskItem = this.projects[i];

                //If the change is already qeued, update its fields.
                var change = this.changeQueue.filter((t: ISpUpdateItem): boolean => {
                    return t.Id == taskId;
                });

                switch (field.name){
                    case 'Status':
                        task.Status.Value = field.value;
                        // Clock out the task if clocked in and not working.
                        if (/(not started|completed)/i.test(field.value) && task.LastTimeOut == null) {
                            self.clockOut(task.Id);
                        }
                        break;

                    case 'OrderBy':
                        //update the order if an OrderBy change
                        if (!!!index) { break; }

                        //TODO
                        // Switch places with the task that has the same OrderBy value.
                        // If the OrderBy value is 5, for example, find the task that is set to 5 and change to the task's index+1;
                        //var orderBy: number = field.value;
                        //for (var i = 0; i < this.projects.length; i++){
                        //    if (this.projects[i].OrderBy == orderBy && this.projects[i].Status.Value == task.Status.Value) {
                        //        this.projects[i].OrderBy = index+1;
                        //    }
                        //}

                        break;

                    default:
                        break;
                }

                if (change.length > 0) { //Update qeued change.

                    // update existing field changes
                    var fields = change[0].fields.filter((f: ISpUpdateField): boolean => {
                        return f.name == field.name;
                    });

                    if (fields.length > 0) {
                        fields[0].value = field.value;
                    } else {
                        change[0].fields.push(field);
                    }

                } else { //Add new change to qeue.
                    this.changeQueue.push({
                        Id: taskId,
                        fields: [field]
                    });
                }

                if (this.config.debug) {
                    console.log(this.changeQueue);
                }

                this.updateColumns();
                return i;             
            }

            return -1;
        }

        private updateColumns(apply: boolean = false): void {

            var self = this;

            for (var i = 0; i < this.columns.length; i++){
                var col: IKanbanColumn = this.columns[i];
                col.tasks = self.projects.filter((task: SharePoint.ISpTaskItem): boolean => {
                    return task.Status.Value == col.status;
                });
            }

            //force a redraw of the columns if dragging projects around
            if (!!this.dragging.task || apply) {
                this.$scope.$apply();
                if (this.config.debug) {
                    console.info('redraw');
                }
            }
        }

        private deleteTask(task: SharePoint.ISpItem, index: number): boolean {
            var self = this;
            if (!confirm('Are you sure you want to delete the item with ID# ' + task.Id + '?')) { return; }

            this.datacontext.deleteListItem(task).then(
                (response: ng.IHttpPromiseCallbackArg<any>): void => {
                    Utils.remove(self.projects, index);
                    self.updateColumns(true);
                });

            return false;
        }

        private refreshData(): boolean {
            var self = this;

            this.datacontext.getProjects(this.siteUrl, this.listName, true, this.kanbanConfig.previousMonths).then(
                (projects: Array<SharePoint.ISpTaskItem>): void => {
                    self.projects = projects;
                    self.updateColumns();
                    self.pristineProjectsData = angular.copy(self.projects, self.pristineProjectsData); 
                });

            return false;
        }

        private viewItem(task: SharePoint.ISpItem): boolean {
            var self = this;
            SharePoint.Utils.openSpDisplayForm(this.siteUrl, this.listName, task);
            return false;
        }

        private newItem(): boolean {
            var self = this;
            SharePoint.Utils.openSpNewForm(this.siteUrl, this.listName, 'New Item', function () {
                console.info(arguments);
                self.refreshData();
            });
            return false;
        }

        private range(end: number): Array<number> {
            var a = [];
            for (var i = 1; i <= end; i++) {
                a.push(i);
            }
            return a;
        }

        private clockIn(id: number): boolean {
            var self = this;
            try {
                var project = this.findProjectById(id);

                if (!!!project) {
                    console.warn('ERROR: Controllers.KanBanController.clockIn() - project is null');
                    return false;
                }

                var now = new Date();
                project.LastTimeIn = now;
                project.LastTimeOut = null;

                var url = self.kanbanConfig.siteUrl + '/_vti_bin/listdata.svc/' + SharePoint.Utils.toCamelCase(self.kanbanConfig.timeLogListName);
                var timeEntryPayload = JSON.stringify({
                    ProjectId: id,
                    TimeIn: now.toISOString()
                });

                this.datacontext.executeRestRequest(url, timeEntryPayload, false, 'POST')
                    .then((response: ng.IHttpPromiseCallbackArg<SharePoint.ISpWrapper<any>>): void => {
                        if (self.config.debug) {
                            console.info('Controllers.KanBanController.clockIn() returned...');
                            console.info(response);
                        }

                        // if not 201 (Created)
                        if (response.status != 201) {
                            alert('Error creating entry in ' + self.kanbanConfig.timeLogListName + '. Status: ' + response.status + '; Status Text: ' + response.statusText);
                            //console.warn(response);
                            return;
                        }

                        // update project fields in memory
                        // setting LastTimeOut to null allows the project to show up in the Working Now section.
                        var projectPayload = {
                            LastTimeIn: Utils.parseMsDateTicks(response.data.d.TimeIn),
                            LastTimeOut: null
                        };
                        self.datacontext.updateListItem(project, projectPayload, function (data: any, statusText: string, jqXhr: JQueryXHR) {
                            // if not 204 (Updated)
                            if (self.config.debug) {
                                console.info('clockIn()');
                                console.info(arguments);
                            }
                            if (!!jqXhr && jqXhr.status != 204) {
                                alert('Error in Kanban.clockIn(). Failed to clock out.');
                                return;
                            }
                            
                            project.LastTimeIn = projectPayload.LastTimeIn;
                            project.LastTimeOut = null;
                        });

                    });
            }
            catch (e) {
                console.warn('ERROR: Controllers.KanBanController.clockIn()...');
                console.warn(e);
            }
            finally {
                return false;
            }
        }

        private clockOut(id: number): boolean {
            var self = this;
            try {
                var project = this.findProjectById(id);

                if (!!!project) {
                    console.warn('ERROR: Controllers.KanBanController.clockOut() - project is null');
                    return false;
                }

                var now = new Date();

                if (!this.config.isProduction) {
                    project.LastTimeOut = now;
                    return;
                }

                //Query the last time entry to get the ID, then update the TimeOut field to now.
                this.datacontext.getSpListItems(this.kanbanConfig.siteUrl, this.kanbanConfig.timeLogListName, 'ProjectId eq ' + project.Id, null, 'Id desc', null, 1).then(
                    (items: Array<SharePoint.ISpItem>): void => {

                        var timeLog = items[0]; // Using `$top` returns a plain Array, not an Array named "results".

                        var projectPayload = {
                            LastTimeOut: now.toISOString() 
                        };

                        var timeLogPayload = {
                            TimeOut: now.toISOString()
                        };

                        //Update list item in time log list
                        self.datacontext.updateListItem(timeLog, timeLogPayload, function (data: any, statusText: string, jqXhr: JQueryXHR) {
                            if (self.config.debug) {
                                console.info('clockOut()');
                                console.info(arguments);
                            }
                            if (!!jqXhr && jqXhr.status != 204) {
                                alert('Error in Kanban.clockOut(). Failed to clock out.');
                                return;
                            }
                        });

                        //Update listitem in project/task list
                        self.datacontext.updateListItem(project, projectPayload, function (data: any, statusText: string, jqXhr: JQueryXHR) {
                            if (self.config.debug) {
                                console.info('clockOut()');
                                console.info(arguments);
                            }
                            if (!!jqXhr && jqXhr.status != 204) {
                                alert('Error in Kanban.clockOut(). Failed to clock out.');
                                return;
                            }
                            project.LastTimeOut = now;
                            self.updateColumns(true);
                        });
                    });
            }
            catch (e) {
                console.warn('ERROR: Controllers.KanBanController.clockOut()...');
                console.warn(e);
            }
            finally {
                return false;
            }
        }

        private findProjectById(id: number): SharePoint.ISpTaskItem {
            if (this.projects == null) { return null; }
            for (var i = 0; i < this.projects.length; i++) {
                if (this.projects[i].Id == id) {
                    return this.projects[i];
                }
            }
            return null;
        }

        private isActive(task: SharePoint.ISpTaskItem): boolean {
            return task.LastTimeOut == null && task.LastTimeIn != null;
        }
    }

    app.controller(KanbanController.Id, KanbanController);

}