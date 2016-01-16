module App.Controllers {
    
    export class ProjectSummary {

        static Id: string = 'projectSummaryController';

        static $inject = ['$state', '$stateParams', 'datacontext', 'projectSiteConfigs'];

        private projects: Array<Array<IPersonProjects>>;
        private groupedProjects: Array<IPersonProjectsGroup>;
        private startDate: Date;
        private endDate: Date;
        private updateState: boolean;
        private filterBy: string;

        constructor(
            private $state: any,
            private $stateParams: IAppStateParams,
            private datacontext: Services.IDatacontext,
            private projectSiteConfigs: Array<IProjectSiteConfig>) {

            this.updateState = false;

            // default dates to current week from Mon to Sun
            var today = new Date();
            var dayOfWeek = today.getDay(); //index of the week - 0-6 - Sun-Sat
            var dayOfMonth = today.getDate();
            var firstDayOfWeek = 1; // Monday - change to your preference, e.g `0` for Sunday etc.
            var lastDayOfWeek = 6;
            // if today's date isn't a the beginning of your week, find the previous date that was. 
            var startDate = dayOfWeek == firstDayOfWeek ? dayOfMonth : dayOfMonth - (dayOfWeek - firstDayOfWeek);

            if (!!$stateParams.start && !!$stateParams.end) {
                var start = $stateParams.start.split('-');
                var end = $stateParams.end.split('-');
                this.startDate = new Date(parseInt(start[0]), (parseInt(start[1])-1), parseInt(start[2]), 0, 0, 0);
                this.endDate = new Date(parseInt(end[0]), (parseInt(end[1])-1), parseInt(end[2]), 23, 59, 0);
                this.getData();

            } else {
                this.updateState = true;
                this.startDate = new Date(today.getFullYear(), today.getMonth(), startDate, 0, 0, 0);
                this.endDate = new Date(today.getFullYear(), today.getMonth(), (startDate + lastDayOfWeek), 23, 59, 0);              
            }

            this.groupedProjects = [];
        }

        private getData(): boolean {
            var self = this;

            //console.info(this.startDate)

            //if (this.updateState) {
                //this.$state.go('app.summary.range', { start: this.startDate.toISOString().split('T')[0], end: this.endDate.toISOString().split('T')[0] });
                //this.updateState = false;
            //}

            this.groupedProjects = []; 

            for (var i = 0; i < this.projectSiteConfigs.length; i++) {
                var config = self.projectSiteConfigs[i];
                var groupTitle = self.projectSiteConfigs[i].title;
                var names = []; //to keep track of unique names

                this.datacontext.getProjectTotals(config.siteUrl, config.listName, this.startDate, this.endDate, groupTitle, config.projectsListName).then(
                    (data: Array<IPersonProjects>): void => {

                        // group multiple project groups under each unique person                        
                        data.forEach(function (o) {
                            var name = o.Name;                       

                            if (names.indexOf(name) < 0) {
                                names.push(name);
                                self.groupedProjects.push({
                                    Name: name,
                                    ProjectGroups: [{
                                        Title: o.Title,
                                        Projects: o.Projects
                                            .filter(function (p) { return p.PersonName == name })
                                            .sort(function (a, b) { return a.TotalHours < b.TotalHours ? 1 : 0; })
                                    }]
                                });
                            }
                            else {
                                self.groupedProjects.filter(function (person) {
                                    return person.Name == name;
                                })[0].ProjectGroups.push({
                                    Title: o.Title,
                                    Projects: o.Projects
                                        .filter(function (p) { return p.PersonName == name })
                                        .sort(function (a, b) { return a.TotalHours < b.TotalHours ? 1 : 0; })
                                });
                            }
                            
                        });
                        
                    });
            }

            return false;
        }

        private viewItem(project: IProjectTotal): boolean {
            var self = this;
            var item: SharePoint.ISpItem = <SharePoint.ISpItem>{
                Id: project.Id, //only need these two propertiesto to create SP dialog; se method `SharePoint.Utils.openSpDisplayForm`
                Title: project.Title
            };
            SharePoint.Utils.openSpDisplayForm(project.SiteUrl, project.ListName, item);
            return false;
        }
    }

    app.controller(ProjectSummary.Id, ProjectSummary);

}