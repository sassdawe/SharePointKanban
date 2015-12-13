module App.Controllers {
    
    export class ProjectSummary {

        static Id: string = 'projectSummaryController';

        static $inject = ['datacontext', 'siteUrl', 'listName'];

        private projects: Array<IPersonProjects>
        private startDate: Date;
        private endDate: Date;

        constructor(private datacontext: Services.IDatacontext, private siteUrl: string, private listName: string) {

        }

        private getData(): boolean {
            var self = this;
            this.datacontext.getProjectTotals(this.siteUrl, this.listName, this.startDate, this.endDate).then(
                (projects: Array<IPersonProjects>): void => {
                    self.projects = projects;
                    console.log(projects);
                });

            return false;
        }

    }

    app.controller(ProjectSummary.Id, ProjectSummary);

}