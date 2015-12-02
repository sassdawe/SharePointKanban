
module App.Controllers{
    
    export class HomeController {

        static Id = "homeController";

        static $inject = ['$scope', 'common', 'config', '$stateParams', 'datacontext'];

        private columns: Array<IKanbanColumn>;

        private changeQueue: Array<ISpUpdateItem>;

        private pristineProjectsData: Array<SharePoint.ISpTaskItem>;

        private priorities: Array<string>;

        private statuses: Array<string>;

        private currentUser: SharePoint.ISpUser;

        private $parent: Controllers.IShellController;

        private projects: Array<SharePoint.ISpTaskItem> = [];

        private userIsEditor: boolean;

        // used by directive, `kanbanColumn`, to reference the current task being dragged over it.
        private dragging: any = {
            task: null
        }

        constructor(
            private $scope: any,
            private common: ICommon,
            private config: IConfiguration,
            private $stateParams: IAppStateParams,
            private datacontext: Services.IDatacontext) {

            this.statuses = this.config.projectStatuses;
            this.priorities = this.config.priorities;
            this.$parent = this.$scope.$parent.shell;
            this.changeQueue = [];      
            this.currentUser = this.$parent.currentUser;
            this.userIsEditor = Utils.userIsEditor(this.currentUser, this.config.editGroups);

            this.refreshData();
        }

        private saveChanges(): boolean {

            if (!confirm('Are you sure you want to save changes to ' + this.changeQueue.length + ' projects?')) { return false; }

            var self = this;

            // update the list item on the server
            this.datacontext.updateSoapListItems(this.changeQueue, this.config.projectSiteUrl, this.config.projectListName).then(
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
            this.projects = Utils.clone(this.pristineProjectsData);
            this.updateColumns();
            this.changeQueue = [];
            return false;
        }

        private updateTask(taskId: number, field: ISpUpdateField): number {

            for (var i = 0; i < this.projects.length; i++) {
                if (this.projects[i].Id == taskId) {

                    //var fields = [];//{ name: 'Status', value: status }

                    //If the change is already qeued, update its fields.
                    var change = this.changeQueue.filter((t: ISpUpdateItem): boolean => {
                        return t.Id == taskId;
                    });

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

                    //if (this.config.debug) {
                    //    console.log(this.changeQueue);
                    //}

                    this.updateColumns();
                    return i;
                }
            }

            return -1;
        }

        private updateColumns(apply: boolean = false): void {
            this.columns = [
                {
                    title: 'Backlog',
                    id: 'backlog-tasks',
                    className: 'panel panel-info',
                    status: 'Not Started',
                    tasks: this.projects.filter((task: SharePoint.ISpTaskItem): boolean => {
                        return task.Status.Value == 'Not Started';
                    })
                },
                {
                    title: 'In Progress',
                    id: 'in-progress-tasks',
                    className: 'panel panel-danger',
                    status: 'In Progress',
                    tasks: this.projects.filter((task: SharePoint.ISpTaskItem): boolean => {
                        return task.Status.Value == 'In Progress';
                    })
                },
                {
                    title: 'Testing',
                    id: 'testing-tasks',
                    className: 'panel panel-warning',
                    status: 'Testing',
                    tasks: this.projects.filter((task: SharePoint.ISpTaskItem): boolean => { 
                        return task.Status.Value == 'Testing';
                    })
                },
                {
                    title: 'Done',
                    id: 'completed-tasks',
                    className: 'panel panel-success',
                    status: 'Completed',
                    tasks: this.projects.filter((task: SharePoint.ISpTaskItem): boolean => {
                        return task.Status.Value == 'Completed';
                    })
                }
            ];

            //force a redraw of the columns if dragging projects around
            if (!!this.dragging.task) {
                this.$scope.$apply();
            }
        }

        private deleteTask(task: SharePoint.ISpItem, index: number): boolean {
            var self = this;
            if (!confirm('Are you sure you want to delete the project with ID# ' + task.Id + '?')) { return; }

            this.datacontext.deleteListItem(task).then(
                (response: ng.IHttpPromiseCallbackArg<any>): void => {
                    Utils.remove(self.projects, index);
                    self.updateColumns(true);
                });

            return false;
        }

        private refreshData(): boolean {
            var self = this;

            this.datacontext.getProjects().then(
                (projects: Array<SharePoint.ISpTaskItem>): void => {
                    self.projects = projects;
                    self.updateColumns();
                    self.pristineProjectsData = Utils.clone(self.projects); 
                });

            return false;
        }

        private viewItem(task: SharePoint.ISpItem): boolean {
            var self = this;
            var itemUrl = this.config.projectSiteUrl + '/Lists/' + this.config.projectListName.replace(/\s/g, '%20') + '/DispForm.aspx?ID=' + task.Id;

            SharePoint.Utils.openSPForm(itemUrl, task.Title, function (result, target) {

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
    }

    app.controller(HomeController.Id, HomeController);

}