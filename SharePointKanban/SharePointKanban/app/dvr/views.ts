module App {

    /** 
    * Views
    *
    * Reusable Angular UI Router view modules
    * Declare all controller views here.
    */

    export class Views {

        private static getTs(): string {
            return '?_='+new Date().getTime();
        }

        public static projects: any = {
            templateUrl: 'app/kanban/kanban.htm' + Views.getTs(),
            controller: 'kanbanController',
            controllerAs: 'vm',
            resolve: {
                kanbanConfig: function (): IKanbanConfig {
                    var statuses = ['Not Started', 'In Progress', 'Testing', 'Completed'];
                    var config: IKanbanConfig = {
                        siteUrl: '/media', //the SharePoint subsite relative URL
                        listName: 'Projects', //the SharePoint list name
                        previousMonths: 18, //how far back to show project tasks
                        timeLogListName: 'Time Log',
                        statuses: statuses,
                        columns: <Array<IKanbanColumn>>[
                            {
                                title: 'Backlog',
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

        public static helpdesk: any = {
            templateUrl: 'app/kanban/kanban.htm' + Views.getTs(),
            controller: 'kanbanController',
            controllerAs: 'vm',
            resolve: {
                kanbanConfig: function (): IKanbanConfig {
                    var statuses = ['Not Started', 'In Progress', 'Completed', 'Waiting on someone else'];
                    var config: IKanbanConfig = {
                        siteUrl: '/ws',
                        listName: 'Tasks',
                        previousMonths: 1,
                        timeLogListName: 'Time Log',
                        statuses: statuses,
                        columns: <Array<IKanbanColumn>>[
                            {
                                title: 'Backlog',
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
                                title: 'Waiting on someone else',
                                id: 'waiting-on-someone-tasks',
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

        public static summary: any = {
            templateUrl: 'app/reports/summary.htm' + Views.getTs(),
            controller: 'projectSummaryController',
            controllerAs: 'vm',
            resolve: {
                projectSiteConfigs: function (): Array<IProjectSiteConfig> {
                    return [
                        { siteUrl: '/media', listName: 'Time Log', title: 'Projects', projectsListName: 'Projects' },
                        { siteUrl: '/ws', listName: 'Time Log', title: 'Support Requests', projectsListName: 'Tasks'  },
                    ]
                }
            }
        }

        public static menu: any = {
            templateUrl: 'app/menu/menu.htm' + Views.getTs(), // the HTML view template 
            controller: 'menuController', // the static ID of the Angular controller
            controllerAs: 'vm' // the alias of the Angular controller in the HTML templates; `vm` short for 'View Model'
        }

        public static footer: any = {
            templateUrl: 'app/footer/footer.htm' + Views.getTs(),
            controller: 'footerController',
            controllerAs: 'vm'
        }

    }

}