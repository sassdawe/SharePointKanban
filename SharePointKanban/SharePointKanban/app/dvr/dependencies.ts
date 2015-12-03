module App {

    export class Dependencies {

        static currentUser = ['datacontext', function (datacontext: Services.IDatacontext) {
            return datacontext.getCurrentUser();
        }]

        static projectsKanbanConfig = ['config', function (config: IConfiguration): IKanbanConfig {
            return config.projectsKanbanConfig;
        }]

        static helpdeskKanbanConfig = ['config', function (config: IConfiguration): IKanbanConfig {
            return config.heldpeskKanbanConfig;
        }]

    }

}