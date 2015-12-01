module App.Services {

    export interface IDatacontext {

        executeRestRequest(url: string, data?: any, cache?: boolean, method?: string, headers?: any): ng.IPromise<any>;

        // REST Methods
        getSpListItems(siteUrl: string, listName: string, filter?: string, select?: string, orderby?: string, expand?: string, top?: number): ng.IPromise<any>;
        getProjects(prevMonths?: number): ng.IPromise<Array<SharePoint.ISpTaskItem>>;
        insertListItem(url: string, data?: any): ng.IPromise<any>;
        updateListItem(item: SharePoint.ISpItem, data?: any): ng.IPromise<any>;
        deleteListItem(item: SharePoint.ISpItem): ng.IPromise<any>;
        deleteAttachment(att: SharePoint.ISpAttachment): ng.IPromise<any>;

        // SOAP Methods
        executeSoapRequest(action: string, packet: string, data: Array<any>, siteUrl?: string, cache?: boolean, headers?: any, service?: string): ng.IPromise<any>
        updateSoapListItems(fields: Array<ISpUpdateItem>, siteUrl: string, listName: string): ng.IPromise<any>;
        getSoapListItems(siteUrl: string, listName: string, viewFields: string, query: string, rowLimit?: number): ng.IPromise<any>;
        searchPrincipals(term: string, maxResults?: number, principalType?: string): ng.IPromise<any>;

        getTestData(): ng.IPromise<Array<SharePoint.ISpTaskItem>>;

    }

    export class Datacontext implements IDatacontext {

        static Id: string = 'datacontext';

        constructor(private $http: any, private $q: ng.IQService, private common: ICommon, private config: IConfiguration) {

        }

        /**
        * Execute a REST request.
        * @param url: string
        * @param method?: string = 'GET'
        * @param headers?: Object = undefined
        * @return IPromise<any>
        */
        public executeRestRequest(url: string, data: any = undefined, cache: boolean = false, method: string = 'GET', headers: any = undefined): ng.IPromise<any> {
            var self = this;
            var d = this.$q.defer();

            this.common.showLoader();

            var params = {
                url: url,
                method: method,
                cache: cache,
                headers: { 'Accept': 'application/json;odata=verbose' }
            };

            if (!!data) {
                params['data'] = data;
            }

            if (!!headers) {
                for (var p in params.headers) {
                    params.headers[p] = headers[p];
                }
            }

            self.$http(params).then((response: ng.IHttpPromiseCallbackArg<any>): void => {
                d.resolve(response);
            }).finally((): void => {
                self.common.hideLoader();
            });

            return d.promise;
        }

        /**
        * Get list item via REST services.
        * @param uri: string
        * @param done: JQueryPromiseCallback<any>
        * @param fail?: JQueryPromiseCallback<any> = undefined
        * @param always?: JQueryPromiseCallback<any> = undefined
        * @return void 
        */
        public getSpListItems(siteUrl: string, listName: string, filter: string = null, select: string = null, orderby: string = null, expand: string = null, top: number = 10): ng.IPromise<Array<any>> {
            var self: any = this;
            var d = this.$q.defer();
            this.common.showLoader();

            var url: Array<string> = [siteUrl + '/_vti_bin/listdata.svc/' + SharePoint.Utils.toCamelCase(listName)];

            if (!!filter) { url.push('$filter=' + filter); }

            if (!!select) { url.push('$select=' + select); }

            if (!!orderby) { url.push('$orderby=' + orderby); }

            if (!!expand) { url.push('$expand=' + expand); }

            url.push('$top=' + top);

            this.executeRestRequest(url.join('&').replace(/\&/, '\?')).then(
                (response: ng.IHttpPromiseCallbackArg<SharePoint.ISpCollectionWrapper<any>>): void => {
                    d.resolve(response.data.d.results);
                });

            return d.promise;
        }

        public getProjects(prevMonths: number = 12): ng.IPromise<Array<SharePoint.ISpTaskItem>> {

            if (!this.config.isProduction) {
                return this.getTestData();
            }

            var today = new Date();
            var dateFilter = new Date(today.getFullYear(), (today.getMonth() - prevMonths), today.getDate(), 0, 0, 0).toISOString();
            var filter = 'CategoryValue eq \'Project\' and Created gt datetime\'' + dateFilter + '\'';
            var select = 'Id,Title,AssignedTo,Attachments,Priority,Status,StartDate,EndDueDate';
            var orderBy = 'PriorityValue desc,Created asc';
            var expand = 'AssignedTo,Attachments,Priority,Status';

            return this.getSpListItems(this.config.projectSiteUrl, this.config.projectListName, filter, select, orderBy, expand, 100);
        }

        public getProject(siteUrl: string, listName: string, itemId: number): ng.IPromise<SharePoint.ISpTaskItem> {
            return this.executeRestRequest(siteUrl + '/_vti_bin/listdata.svc/' + SharePoint.Utils.toCamelCase(listName) + '(' + itemId + ')');
        }

        public insertListItem(url: string, data: any = undefined): ng.IPromise<any> {
            return this.executeRestRequest(url, data, false, 'POST');
        }

        public updateListItem(item: SharePoint.ISpItem, data: any = undefined): ng.IPromise<any> {
            var headers = {
                'Accept': 'application/json;odata=verbose',
                'X-HTTP-Method': 'MERGE',
                'If-Match': item.__metadata.etag
            };
            return this.executeRestRequest(item.__metadata.uri, data, false, 'POST', headers);
        }

        /**
        * Delete the list item.
        * @param model: IViewModel 
        * @param callback?: Function = undefined
        * @return IPromise<any>
        */
        public deleteListItem(item: SharePoint.ISpItem): ng.IPromise<any> {
            var headers = {
                'Accept': 'application/json;odata=verbose',
                'X-Http-Method': 'DELETE',
                'If-Match': item.__metadata.etag
            };
            return this.executeRestRequest(item.__metadata.uri, null, false, 'POST', headers);
        }

        /**
        * Delete an attachment.
        * @param att: SharePoint.ISpAttachment
        * @return IPromise<any>
        */
        public deleteAttachment(att: SharePoint.ISpAttachment): ng.IPromise<any> {
            var headers = {
                'Accept': 'application/json;odata=verbose',
                'X-HTTP-Method': 'DELETE'
            };
            return this.executeRestRequest(att.__metadata.uri, null, false, 'POST', headers);
        }

        /**
        * Execute SOAP Request
        * @param action: string
        * @param packet: string
        * @param params: Array<any>
        * @param siteUrl?: string = ''
        * @param cache: boolean? = false
        * @param service?: string = 'lists.asmx'
        * @return IPromise<any>
        */
        public executeSoapRequest(action: string, packet: string, data: Array<any>, siteUrl: string = '', cache: boolean = false, headers: any = undefined, service: string = 'lists.asmx'): ng.IPromise<any> {

            var d = this.$q.defer();
            var self = this;
            this.common.showLoader();

            var serviceUrl: string = siteUrl + '/_vti_bin/' + service;

            if (!!data) {
                for (var i = 0; i < data.length; i++) {
                    packet = packet.replace('{' + i + '}', (data[i] == null ? '' : data[i]));
                }
            }

            var params = {
                url: serviceUrl,
                data: packet,
                method: 'POST',
                cache: cache,
                headers: {
                    'Content-Type': 'text/xml; charset=utf-8',
                    'SOAPAction': action
                }
            };

            if (!!headers) {
                for (var p in headers) {
                    params.headers[p] = headers[p];
                }              
            }
            this.$http(params).then((response: ng.IHttpPromiseCallbackArg<any>): void => {
                d.resolve(response);
            }).finally((): void => {
                self.common.hideLoader();
            });

            return d.promise;
        }

        /**
        * Update batch of list items via SOAP services. 
        * @param listName: string
        * @param fields: Array<Array<any>>
        * @param isNew?: boolean = true
        * param callback?: Function = undefined
        * @param self: SPForm = undefined
        * @return void
        */
        public updateSoapListItems(fields: Array<ISpUpdateItem>, siteUrl: string, listName: string): ng.IPromise<any> {

            if (!this.config.isProduction) {
                var d = this.$q.defer();
                d.resolve({
                    status: 200,
                    statusText: 'OK'
                });
                return d.promise;
            }

            var action = 'http://schemas.microsoft.com/sharepoint/soap/UpdateListItems';
            var packet = '<?xml version="1.0" encoding="utf-8"?>' +
                '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
                '<soap:Body>' +
                '<UpdateListItems xmlns="http://schemas.microsoft.com/sharepoint/soap/">' +
                '<listName>{0}</listName>' +
                '<updates>{1}</updates>' +
                '</UpdateListItems>' +
                '</soap:Body>' +
                '</soap:Envelope>';

            var batch = ["<Batch OnError='Continue'>"];

            for (var i = 0; i < fields.length; i++) {
                batch.push("<Method ID='1' Cmd='Update'>");

                for (var j = 0; j < fields[i].fields.length; j++) {
                    batch.push("<Field Name='" + fields[i].fields[j].name + "'>" + SharePoint.Utils.escapeColumnValue(fields[i].fields[j].value) + "</Field>");
                }

                batch.push("<Field Name='ID'>" + fields[i].Id + "</Field>");

                batch.push("</Method>");
            }

            batch.push("</Batch>");

            packet = packet.replace(/\{0\}/, listName).replace(/\{1\}/, batch.join());

            return this.executeSoapRequest(action, packet, null, siteUrl);
        }

        public getSoapListItems(siteUrl: string, listName: string, viewFields: string, query: string, rowLimit: number = 25): ng.IPromise<any> {

            var packet = '<?xml version="1.0" encoding="utf-8"?>' +
                '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
                '<soap:Body>' +
                '<GetListItems xmlns="http://schemas.microsoft.com/sharepoint/soap/">' +
                '<listName>' + listName + '</listName>' +
                '<query>' + query + '</query>' +
                '<viewFields>' + viewFields + '</viewFields>' +
                '<rowLimit>' + rowLimit + '</rowLimit>' +
                '</GetListItems>' +
                '</soap:Body>' +
                '</soap:Envelope>';

            return this.executeSoapRequest('http://schemas.microsoft.com/sharepoint/soap/GetListItems', packet, null, siteUrl); 
        }

        public searchPrincipals(term: string, maxResults: number = 10, principalType: string = 'User'): ng.IPromise<any> {
            var d = this.$q.defer();

            var action = 'http://schemas.microsoft.com/sharepoint/soap/SearchPrincipals';
            var params = [term, maxResults, principalType];
            var packet: string = '<?xml version="1.0" encoding="utf-8"?>' +
                '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
                '<soap:Body>' +
                '<SearchPrincipals xmlns="http://schemas.microsoft.com/sharepoint/soap/">' +
                '<searchText>{0}</searchText>' +
                '<maxResults>{1}</maxResults>' +
                '<principalType>{2}</principalType>' + //'None' or 'User' or 'DistributionList' or 'SecurityGroup' or 'SharePointGroup' or 'All'
                '</SearchPrincipals>' +
                '</soap:Body>' +
                '</soap:Envelope>';

            this.executeSoapRequest(action, packet, params, '', true, null, 'People.asmx').then(
                (response: ng.IHttpPromiseCallbackArg<any>): void => {
                    var xmlDoc = response.data;
                    var results: Array<SharePoint.IPrincipalInfo> = [];

                    $(xmlDoc).find('PrincipalInfo').each((i: number, n: any): void => {
                        results.push({
                            AccountName: $('AccountName', n).text(),
                            UserInfoID: parseInt($('UserInfoID', n).text()),
                            DisplayName: $('DisplayName', n).text(),
                            Email: $('Email', n).text(),
                            Title: $('Title', n).text(), //job title
                            IsResolved: $('IsResolved', n).text() == 'true' ? !0 : !1,
                            PrincipalType: $('PrincipalType', n).text()
                        });
                    });

                    d.resolve(results);
                });

            return d.promise;
        }

        public getTestData(): ng.IPromise<Array<SharePoint.ISpTaskItem>> {
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