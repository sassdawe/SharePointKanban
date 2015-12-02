
module App.Controllers{
    
    export class HomeController {

        static Id = "homeController";

        static $inject = ['$scope', 'common', 'config', '$stateParams', 'datacontext'];

        private columns: Array<IKanbanColumn>;

        private changeQueue: Array<ISpUpdateItem>;

        private pristineProjectsData: Array<SharePoint.ISpTaskItem>;

        private priorities: Array<string> = ['(1) High', '(2) Normal', '(3) Low'];

        private statuses: Array<string> = ['Not Started', 'In Progress', 'Testing', 'Completed'];

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

            this.refreshData();

            this.$parent = this.$scope.$parent.shell;
            this.changeQueue = [];      
            this.currentUser = this.$parent.currentUser;
            this.updateColumns();
            this.userIsEditor = Utils.userIsEditor(this.currentUser, this.config.editGroups);
        }

        private saveChanges(): boolean {

            if (!confirm('Are you sure you want to save changes to ' + this.changeQueue.length + ' projects?')) { return false; }

            var self = this;

            // update the list item on the server
            this.datacontext.updateSoapListItems(this.changeQueue, this.config.projectSiteUrl, this.config.projectListName).then(
                (response: ng.IHttpPromiseCallbackArg<any>): void => {
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

        private updateTaskStatus(taskId: number, status: string, priority: string = undefined): number {

            for (var i = 0; i < this.projects.length; i++) {
                if (this.projects[i].Id == taskId) {

                    var fields = [];

                    if (!!status) {
                        this.projects[i].Status.Value = status; //Update the project in memory.

                        fields.push({ name: 'Status', value: status });
                    }

                    if (!!priority) {
                        this.projects[i].Priority.Value = priority; //Update the project in memory.

                        fields.push({ name: 'Priority', value: priority });
                    }

                    //If the change is already qeued, update its fields.
                    var change = this.changeQueue.filter((t: ISpUpdateItem): boolean => {
                        return t.Id == taskId;
                    });

                    if (change.length > 0) { //Update qeued change.
                        change[0].fields = fields;

                    } else { //Add new change to qeue.
                        this.changeQueue.push({
                            Id: taskId,
                            fields: fields
                        });
                    }

                    this.updateColumns(true);
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
            
            if (apply) {
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
    }

    app.controller(HomeController.Id, HomeController);

}