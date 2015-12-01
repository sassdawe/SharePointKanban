module App.Services {

    export interface IDatacontext {

        getSpListItems(siteUrl: string, listName: string, filter?: string, select?: string, orderby?: string, expand?: string, top?: number): ng.IPromise<any>;
        getProjects(): ng.IPromise<Array<SharePoint.ISpTaskItem>>;
        getTestData(): ng.IPromise<Array<SharePoint.ISpTaskItem>>;

    }

    export class Datacontext implements IDatacontext {

        static Id: string = 'datacontext';

        constructor(private $http: any, private $q: ng.IQService, private common: ICommon, private config: IConfiguration) {

        }

        /**
        * Get list item via REST services.
        * @param uri: string
        * @param done: JQueryPromiseCallback<any>
        * @param fail?: JQueryPromiseCallback<any> = undefined
        * @param always?: JQueryPromiseCallback<any> = undefined
        * @return void 
        */
        getSpListItems(siteUrl: string, listName: string, filter: string = null, select: string = null, orderby: string = null, expand: string = null, top: number = 10): ng.IPromise<Array<any>> {
            var self: any = this;
            var deferred = this.$q.defer();
            this.common.showLoader();

            var url: Array<string> = [siteUrl + '/_vti_bin/listdata.svc/' + SharePoint.Utils.toCamelCase(listName)];

            if (!!filter) { url.push('$filter=' + filter); }

            if (!!select) { url.push('$select=' + select); }

            if (!!orderby) { url.push('$orderby=' + orderby); }

            if (!!expand) { url.push('$expand=' + expand); }

            url.push('$top=' + top);

            self.$http({
                url: url.join('&').replace(/\&/, '\?'),
                method: 'GET',
                headers: { 'Accept': 'application/json;odata=verbose' }
            }).then((response: ng.IHttpPromiseCallbackArg<SharePoint.ISpCollectionWrapper<any>>): void => {

                deferred.resolve(response.data.d.results);

            }).finally((): void => {
                self.common.hideLoader();
            });

            return deferred.promise;
        }

        getProjects(): ng.IPromise<Array<SharePoint.ISpTaskItem>> {
            return this.getSpListItems(this.config.projectSiteUrl, this.config.projectListName, null, null, 'Created desc', 'AssignedTo,Attachments,CreatedBy,ModifiedBy,Priority,Status', 100);
        }

        getTestData(): ng.IPromise<Array<SharePoint.ISpTaskItem>> {
            var d = this.$q.defer();
            var self = this;

            self.$http({
                url: '/testdata.txt',
                method: 'GET'
            }).then((response: ng.IHttpPromiseCallbackArg<SharePoint.ISpCollectionWrapper<SharePoint.ISpTaskItem>>): void => {

                if (response.status != 200) {
                    d.resolve(null);
                    d.reject(response.statusText);
                    return;
                }

                d.resolve(response.data.d.results);

            }).finally((): void => {
                self.common.hideLoader();
            });

            return d.promise;
        }
    }

    // Register with angular
    app.factory(Datacontext.Id, ['$http', '$q', 'common', 'config', function factory($http: any, $q: ng.IQService, common: ICommon, config: IConfiguration) {
        return new Datacontext($http, $q, common, config);
    }]);

}