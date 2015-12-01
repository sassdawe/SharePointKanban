
module App.Controllers{
    
    export class HomeController {

        static Id = "homeController";

        static $inject = ['common', 'config', '$stateParams', 'datacontext', 'projects'];

        public columns: Array<IKanbanColumn>;

        public dragging: any = {
            task: null,
            col: null,
            index: null
        }

        public projects: Array<SharePoint.ISpTaskItem>;

        constructor(
            private common: ICommon,
            private config: IConfiguration,
            private $stateParams: IAppStateParams,
            private datacontext: Services.IDatacontext,
            projects: Array<SharePoint.ISpTaskItem>) {

            this.projects = projects;
            this.updateColumns();
        }

        public updateColumns(): void {
            this.columns = [
                {
                    title: 'Backlog',
                    id: 'backlog-tasks',
                    className: 'panel panel-info',
                    tasks: this.projects.filter((task: SharePoint.ISpTaskItem): boolean => {
                        return task.Status.Value == 'Not Started';
                    })
                },
                {
                    title: 'In Progress',
                    id: 'in-progress-tasks',
                    className: 'panel panel-danger',
                    tasks: this.projects.filter((task: SharePoint.ISpTaskItem): boolean => {
                        return task.Status.Value == 'In Progress';
                    })
                },
                {
                    title: 'Testing',
                    id: 'testing-tasks',
                    className: 'panel panel-warning',
                    tasks: this.projects.filter((task: SharePoint.ISpTaskItem): boolean => {
                        return task.Status.Value == 'Testing';
                    })
                },
                {
                    title: 'Done',
                    id: 'completed-tasks',
                    className: 'panel panel-success',
                    tasks: this.projects.filter((task: SharePoint.ISpTaskItem): boolean => {
                        return task.Status.Value == 'Completed';
                    })
                }
            ];
        }

        public refreshBoard(): void {
            var self = this;

            this.datacontext.getTestData().then(
                (projects: Array<SharePoint.ISpTaskItem>): void => {
                    self.projects = projects;
                    self.updateColumns();
                });
        }

    }

    app.controller(HomeController.Id, HomeController);

}