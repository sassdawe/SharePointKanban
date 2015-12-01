module App {

    /** 
    * Views
    *
    * Reusable Angular UI Router view modules
    * Declare all controller views here.
    */

    export class Views {

        private static ts(): string {
            return '?_=' + new Date().getTime();
        } 

        public static menu: any = {
            templateUrl: 'app/menu/menu.htm' + Views.ts(), // the HTML view template 
            controller: 'menuController', // the static ID of the Angular controller
            controllerAs: 'vm' // the alias of the Angular controller in the HTML templates; `vm` short for 'View Model'
        }

        public static home: any = {
            templateUrl: 'app/home/home.htm' + Views.ts(),
            controller: 'homeController',
            controllerAs: 'vm',
            resolve: {
                projects: Dependencies.projectList
            }
        }

        public static footer: any = {
            templateUrl: 'app/footer/footer.htm' + Views.ts(),
            controller: 'footerController',
            controllerAs: 'vm'
        }

        public static kanban: any = {
            templateUrl: 'app/kanban/index.htm' + Views.ts(),
            controller: 'kanbanController',
            controllerAs: 'vm'
        }

    }

}