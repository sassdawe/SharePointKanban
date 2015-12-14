module App.Controllers {
    
    export class ProjectSummary {

        static Id: string = 'projectSummaryController';

        static $inject = ['$state', '$stateParams', 'datacontext', 'projectSiteConfigs'];

        private projects: Array<Array<IPersonProjects>>;
        private groupedProjects: Array<IPersonProjectsGroup>;
        private startDate: Date;
        private endDate: Date;
        private updateState: boolean;

        constructor(
            private $state: any,
            private $stateParams: IAppStateParams,
            private datacontext: Services.IDatacontext,
            private projectSiteConfigs: Array<IProjectSiteConfig>) {

            this.updateState = false;

            // default dates to current week from Mon to Sun
            var days = ['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat']; // 6-5,5-4,4-3,3-2,2-1
            var today = new Date();
            var dayOfWeek = today.getDay();
            var dayOfMonth = today.getDate();
            var mondayDate = days[dayOfWeek] == 'Mon' ? dayOfMonth : dayOfMonth - (6 - dayOfWeek);

            if (!!$stateParams.start && !!$stateParams.end) {
                var start = $stateParams.start.split('-');
                var end = $stateParams.end.split('-');
                this.startDate = new Date(parseInt(start[0]), parseInt(start[1])-1, parseInt(start[2]));
                this.endDate = new Date(parseInt(end[0]), parseInt(end[1]) - 1, parseInt(end[2]));
                this.getData();

            } else {
                this.updateState = true;
                this.startDate = new Date(today.getFullYear(), today.getMonth(), mondayDate, 0, 0, 0);
                this.endDate = new Date(today.getFullYear(), today.getMonth(), mondayDate + 6, 0, 0, 0);              
            }

            this.groupedProjects = [];
        }

        private getData(): boolean {
            var self = this;

            console.info(this.startDate)

            //if (this.updateState) {
                //this.$state.go('app.summary.range', { start: this.startDate.toISOString().split('T')[0], end: this.endDate.toISOString().split('T')[0] });
                //this.updateState = false;
            //}

            this.groupedProjects = []; 

            for (var i = 0; i < this.projectSiteConfigs.length; i++) {
                var config = self.projectSiteConfigs[i];
                var groupTitle = self.projectSiteConfigs[i].title;
                var names = []; //to keep track of unique names

                this.datacontext.getProjectTotals(config.siteUrl, config.listName, this.startDate, this.endDate, groupTitle).then(
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

    }

    app.controller(ProjectSummary.Id, ProjectSummary);

}