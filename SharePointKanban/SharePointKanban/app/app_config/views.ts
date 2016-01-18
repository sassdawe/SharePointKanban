module App {

    export class Views {
        /////////////////////
        // The Kanban Config
        /////////////////////
        public static projects = {
            templateUrl: 'app/kanban/kanban.htm' + Utils.getTimestamp(),
            controller: 'kanbanController',
            controllerAs: 'vm',
            resolve: {
                // Change SharePoint Project/Tasks configurations as needed. 
                // This will be injected into the Kanban Controller
                kanbanConfig: function (): IKanbanConfig {
                    var statuses = ['Not Started', 'In Progress', 'Testing', 'Completed'];
                    var config: IKanbanConfig = {
                        siteUrl: '/', //the SharePoint subsite relative URL
                        listName: 'Tasks', //the SharePoint list name
                        previousMonths: 18, //how far back to show project tasks
                        timeLogListName: 'Time Log',
                        statuses: statuses,
                        columns: <Array<IKanbanColumn>>[
                            {
                                title: 'Queue',
                                id: 'backlog-tasks',
                                className: 'panel panel-info',
                                status: statuses[0],
                                tasks: []
                            },
                            {
                                title: 'In Progress',
                                id: 'in-progress-tasks',
                                className: 'panel panel-danger',
                                status: statuses[1],
                                tasks: []
                            },
                            {
                                title: 'Testing',
                                id: 'testing-tasks',
                                className: 'panel panel-warning',
                                status: statuses[2],
                                tasks: []
                            },
                            {
                                title: 'Done',
                                id: 'completed-tasks',
                                className: 'panel panel-success',
                                status: statuses[3],
                                tasks: []
                            }
                        ]
                    };

                    return config;
                }
            }
        }

        ///////////////////////////
        // Project Summary Reports
        ///////////////////////////
        public static summary = {
            templateUrl: 'app/reports/summary.htm' + Utils.getTimestamp(),
            controller: 'projectSummaryController',
            controllerAs: 'vm',
            resolve: {
                projectSiteConfigs: function (): Array<IProjectSiteConfig> {
                    // List as many SharePoint Project/Tasks configurations here as needed. 
                    return [
                        { siteUrl: '/', listName: 'Time Log', title: 'Projects', projectsListName: 'Tasks' }
                    ]
                }
            }
        }

        /////////////
        // Main Menu
        /////////////
        public static menu = {
            templateUrl: 'app/menu/menu.htm' + Utils.getTimestamp(), // the HTML view template 
            controller: 'menuController', // the static ID of the Angular controller
            controllerAs: 'vm' // the alias of the Angular controller in the HTML templates; `vm` short for 'View Model'
        }

        ///////////
        // Footer
        ///////////
        public static footer = {
            templateUrl: 'app/footer/footer.htm' + Utils.getTimestamp(),
            controller: 'footerController',
            controllerAs: 'vm'
        }
    }
    
}