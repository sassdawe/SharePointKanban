module App {

    export class Dependencies {

        static currentUser = ['datacontext', function (datacontext: Services.IDatacontext) {
            return datacontext.getCurrentUser();
        }]

    }

}