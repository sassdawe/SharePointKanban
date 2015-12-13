module App.Controllers {
    
    export class ProjectSummary {

        static Id: string = 'projectSummaryController';

        static $inject = ['datacontext', 'projectSiteConfigs'];

        private projects: Array<Array<IPersonProjects>>;
        private groupedProjects: Array<IPersonProjectsGroup>;
        private startDate: Date;
        private endDate: Date;

        constructor(private datacontext: Services.IDatacontext,
            private projectSiteConfigs: Array<IProjectSiteConfig>) {

            // default dates to current week from Mon to Sun
            var days = ['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat']; // 6-5,5-4,4-3,3-2,2-1
            var today = new Date();
            var dayOfWeek = today.getDay();
            var dayOfMonth = today.getDate();
            var mondayDate = days[dayOfWeek] == 'Mon' ? dayOfMonth : dayOfMonth - (6 - dayOfWeek);
            this.startDate = new Date(today.getFullYear(), today.getMonth(), mondayDate, 0, 0, 0);
            this.endDate = new Date(today.getFullYear(), today.getMonth(), mondayDate + 6, 0, 0, 0);

            this.groupedProjects = [];
        }

        private getData(): boolean {
            var self = this;

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
                                    }]
                                });
                            }
                            else {
                                self.groupedProjects.filter(function (person) {
                                    return person.Name == name;
                                })[0].ProjectGroups.push({
                                    Title: o.Title,
                                    Projects: o.Projects
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