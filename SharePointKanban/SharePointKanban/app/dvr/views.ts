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
                kanbanConfig: Dependencies.projectsKanbanConfig
            }
        }

        public static helpdesk: any = {
            templateUrl: 'app/kanban/kanban.htm' + Views.getTs(),
            controller: 'kanbanController',
            controllerAs: 'vm',
            resolve: {
                kanbanConfig: Dependencies.helpdeskKanbanConfig
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