module App.Controllers {

    export class FooterController {

        static Id = 'footerController';

        static $inject = ['config'];

        public copyright: string;

        constructor(private config: IConfiguration) {
            this.copyright = '&copy; ' + config.orgName + ' ' + new Date().getFullYear();
        }
    }

    app.controller(FooterController.Id, FooterController);
}