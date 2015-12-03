
module App.Controllers{

    export interface IKanbanController {
        updateTask(taskId: number, field: ISpUpdateField): number;
        dragging: any;
        clockIn(task: SharePoint.ISpTaskItem): boolean;
        clockOut(task: SharePoint.ISpTaskItem): boolean;
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
            this.statuses = [];

            for (var i = 0; i < this.columns.length; i++) {
                if (this.statuses.indexOf(this.columns[i].status) < 0) {
                    this.statuses.push(this.columns[i].status);
                }
            }

            this.priorities = this.config.priorities;
            this.$parent = this.$scope.$parent.shell;
            this.changeQueue = [];      
            this.currentUser = this.$parent.currentUser;
            this.userIsEditor = Utils.userIsEditor(this.currentUser, this.config.editGroups);
            this.now = new Date();
            this.refreshData();
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
                            this.clockOut(task);
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
                this.statuses.push(col.status);
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

        public clockIn(task: SharePoint.ISpTaskItem): boolean {
            this.datacontext.clockIn(task, this.kanbanConfig.siteUrl, this.kanbanConfig.timeLogListName).then((timeIn: Date): void => {
                task.LastTimeIn = timeIn;
                task.LastTimeOut = null;
            });
            return false;
        }

        public clockOut(task: SharePoint.ISpTaskItem): boolean {
            this.datacontext.clockOut(task, this.kanbanConfig.siteUrl, this.kanbanConfig.timeLogListName).then((timeOut: Date): void => {
                task.LastTimeOut = timeOut;
            });

            return false;
        }

        private isActive(task: SharePoint.ISpTaskItem): boolean {
            return task.LastTimeOut == null && task.LastTimeIn != null;
        }
    }

    app.controller(KanbanController.Id, KanbanController);

}