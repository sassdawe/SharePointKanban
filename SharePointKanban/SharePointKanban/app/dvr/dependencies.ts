module App {

    export class Dependencies {

        static projectList: Array<any> = ['datacontext', function (datacontext: Services.IDatacontext) {
            return datacontext.getProjects();
        }]

        static currentUser: Array<any> = ['datacontext', function (datacontext: Services.IDatacontext) {
            return datacontext.getCurrentUser();
        }]

    }

}