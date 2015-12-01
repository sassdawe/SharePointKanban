module App {

    export class Dependencies {

        static projectList: Array<any> = ['datacontext', function (datacontext: Services.IDatacontext) {
            return datacontext.getProjects();
        }]

    }

}