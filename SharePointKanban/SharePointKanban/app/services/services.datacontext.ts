module App.Services {

    export interface IDatacontext {

        executeRestRequest(url: string, data?: any, cache?: boolean, method?: string, headers?: any): ng.IPromise<any>;

        // REST Methods
        getSpListItems(siteUrl: string, listName: string, filter?: string, select?: string, orderby?: string, expand?: string, top?: number): ng.IPromise<any>;
        getProjects(siteUrl: string, listName: string, force?: boolean, prevMonths?: number): ng.IPromise<Array<SharePoint.ISpTaskItem>>;
        insertListItem(url: string, data?: any): ng.IPromise<any>;
        updateListItem(item: SharePoint.ISpItem, data, callback: Function): void;
        deleteListItem(item: SharePoint.ISpItem): ng.IPromise<any>;
        deleteAttachment(att: SharePoint.ISpAttachment): ng.IPromise<any>;
        getProjectTotals(siteUrl: string, listName: string, start: Date, end: Date, title: string, projectsListName: string): ng.IPromise<Array<IPersonProjects>>;

        // SOAP Methods
        executeSoapRequest(action: string, packet: string, data: Array<any>, siteUrl?: string, cache?: boolean, headers?: any, service?: string): ng.IPromise<any>
        updateSoapListItems(fields: Array<ISpUpdateItem>, siteUrl: string, listName: string): ng.IPromise<any>;
        getSoapListItems(siteUrl: string, listName: string, viewFields: string, query: string, cache?: boolean, rowLimit?: number): ng.IPromise<any>;
        searchPrincipals(term: string, maxResults?: number, principalType?: string): ng.IPromise<any>;
        getCurrentUser(): ng.IPromise<SharePoint.ISpUser>;
        getUsersGroups(loginName: string): ng.IPromise<Array<SharePoint.ISpGroup>>;
    }

    export class Datacontext implements IDatacontext {

        static Id: string = 'datacontext';

        public cache: any;

        constructor(private $http: any, private $q: ng.IQService, private common: ICommon, private config: IConfiguration) {
            this.cache = {};
            this.common.hideLoader();
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
                url: this.config.serverHostname + url,
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

            this.$http(params).then((response: ng.IHttpPromiseCallbackArg<any>): void => {
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
            siteUrl = siteUrl == '/' ? '' : siteUrl;
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

                    if (response.status != 200) {
                        d.reject(response.statusText);
                        console.warn(response);
                        return;
                    }

                    if (!!response.data.d.results) {
                        d.resolve(response.data.d.results);
                    } else {
                        d.resolve(response.data.d);
                    }
                });

            return d.promise;
        }

        public getProjects(siteUrl: string, listName: string, force: boolean = false, prevMonths: number = 6): ng.IPromise<Array<SharePoint.ISpTaskItem>> {
            var d = this.$q.defer();
            var self = this;
            var today = new Date();
            var dateFilter = new Date(today.getFullYear(), (today.getMonth() - prevMonths), today.getDate(), 0, 0, 0).toISOString();
            var filter = 'CategoryValue ne \'Log\' and Created gt datetime\'' + dateFilter + '\'';
            var select = 'Id,Title,AssignedTo,Attachments,Priority,Status,StartDate,DueDate,OrderBy,LastTimeIn,LastTimeOut';
            var orderBy = 'PriorityValue asc,Created asc';
            var expand = 'AssignedTo,Attachments,Priority,Status';

            this.getSpListItems(siteUrl, listName, filter, select, orderBy, expand, 1000).then(
                (projects: Array<SharePoint.ISpTaskItem>): void => {

                    // parse all the dates
                    projects.forEach((p: SharePoint.ISpTaskItem): void => {    
                        p.Created = Utils.parseMsDateTicks(p.Created);
                        p.Modified = Utils.parseMsDateTicks(p.Modified);
                        if (!!p.LastTimeIn) {
                            p.LastTimeIn = Utils.parseMsDateTicks(p.LastTimeIn);
                        }
                        if (!!p.LastTimeOut) {
                            p.LastTimeOut = Utils.parseMsDateTicks(p.LastTimeOut);
                        }
                        if (!!p.StartDate) {
                            p.StartDate = Utils.parseMsDateTicks(p.StartDate);
                        }
                        if (!!p.DueDate) {
                            p.DueDate = Utils.parseMsDateTicks(p.DueDate);
                        }
                    });

                    d.resolve(projects);
                });

            return d.promise;
        }

        public getProject(siteUrl: string, listName: string, itemId: number): ng.IPromise<SharePoint.ISpTaskItem> {
            siteUrl = siteUrl == '/' ? '' : siteUrl;
            return this.executeRestRequest(siteUrl + '/_vti_bin/listdata.svc/' + SharePoint.Utils.toCamelCase(listName) + '(' + itemId + ')');
        }

        public insertListItem(url: string, data: any = undefined): ng.IPromise<ng.IHttpPromiseCallbackArg<any>> {
            return this.executeRestRequest(url, JSON.stringify(data), false, 'POST');
        }

        public updateListItem(item: SharePoint.ISpItem, data, callback: Function): void {
            var self = this;

            // Angular's $http does not work for this!
            var $jqXhr: JQueryXHR = $.ajax({
                url: item.__metadata.uri,
                type: 'POST',
                contentType: 'application/json',
                processData: false,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("If-Match", item.__metadata.etag);
                    // Using MERGE so that the entire entity doesn't need to be sent over the wire. 
                    xhr.setRequestHeader("X-HTTP-Method", 'MERGE');
                },
                data: JSON.stringify(data)
            });

            $jqXhr.done(function (data, status, jqXhr) {
                if (self.config.debug) {
                    console.info('Services.Datacontext.updateListItem() returned...');
                    console.info(arguments);
                }
                if (callback) {
                    callback(arguments);
                }
            });

            $jqXhr.always(function () {
                self.common.hideLoader();
            });

            $jqXhr.fail(function (jqXhr: JQueryXHR, status: string, error: string) {
                if (callback) {
                    callback(arguments);
                }
                if (self.config.debug) {
                    console.warn('Error in Datacontext.updateListItem(): ' + status + ' ' + error);
                }
            });
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
            siteUrl = siteUrl == '/' ? '' : siteUrl;
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

        public getSoapListItems(siteUrl: string, listName: string, viewFields: string, query: string, cache: boolean = false, rowLimit: number = 25): ng.IPromise<any> {

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

            return this.executeSoapRequest('http://schemas.microsoft.com/sharepoint/soap/GetListItems', packet, null, siteUrl, cache); 
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

        public getCurrentUser(): ng.IPromise<SharePoint.ISpUser> {
            var d = this.$q.defer();
            var self = this;

            if (!!this.cache.currentUser) {
                d.resolve(this.cache.currentUser);
                return d.promise;
            }

            var user: SharePoint.ISpUser = {
                ID: null,
                Title: null,
                Name: null,
                EMail: null,
                JobTitle: null,
                Department: null,
                Account: null,
                UserName: null,
                Office: null,
                Groups: []
            };

            var query = '<Query><Where><Eq><FieldRef Name="ID" /><Value Type="Counter"><UserID /></Value></Eq></Where></Query>';
            var viewFields = '<ViewFields><FieldRef Name="ID" /><FieldRef Name="Name" /><FieldRef Name="EMail" /><FieldRef Name="Department" /><FieldRef Name="JobTitle" /><FieldRef Name="UserName" /><FieldRef Name="Office" /></ViewFields>';

            this.getSoapListItems('', 'User Information List', viewFields, query, true).then(
                (response: ng.IHttpPromiseCallbackArg<any>): void => {

                    var xmlDoc = response.data;

                    var $zrows = $(xmlDoc).find('*').filter(function () {
                        return this.nodeName.toLowerCase() == 'z:row';
                    });

                    $zrows.each(function () {
                        user.ID = parseInt($(this).attr('ows_ID'));
                        user.Title = $(this).attr('ows_Title');
                        user.Name = $(this).attr('ows_Name');
                        user.EMail = $(this).attr('ows_EMail');
                        user.JobTitle = $(this).attr('ows_JobTitle');
                        user.Department = $(this).attr('ows_Department');
                        user.Account = user.ID + ';#' + user.Title;
                        user.Groups = [];
                    });

                    if (!!user.Name) {
                        self.getUsersGroups(user.Name).then(
                            (groups: Array<SharePoint.ISpGroup>): void => {
                                user.Groups = groups;

                                self.cache.currentUser = user;
                                d.resolve(user);
                            });
                    } else {

                        self.cache.currentUser = user;
                        d.resolve(user);
                    }
                });

            return d.promise;
        }

        public getUsersGroups(loginName: string): ng.IPromise<Array<SharePoint.ISpGroup>> {
            var d = this.$q.defer();

            var packet = '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
                '<soap:Body>' +
                '<GetGroupCollectionFromUser xmlns="http://schemas.microsoft.com/sharepoint/soap/directory/">' +
                '<userLoginName>' + loginName + '</userLoginName>' +
                '</GetGroupCollectionFromUser>' +
                '</soap:Body>' +
                '</soap:Envelope>';

            var action = 'http://schemas.microsoft.com/sharepoint/soap/directory/GetGroupCollectionFromUser';

            this.executeSoapRequest(action, packet, null, '', true, null, 'usergroup.asmx').then(
                (response: ng.IHttpPromiseCallbackArg<any>): void => {
                    var xmlDoc = response.data;
                    var $errorText = $(xmlDoc).find('errorstring');

                    // catch and handle returned error
                    if (!!$errorText && $errorText.text() != "") {
                        d.reject($errorText.text());
                        return;
                    }

                    var groups: Array<SharePoint.ISpGroup> = [];

                    $(xmlDoc).find("Group").each(function (i: number, el: HTMLElement) {
                        groups.push({
                            id: parseInt($(el).attr("ID")),
                            name: $(el).attr("Name")
                        });
                    });

                    d.resolve(groups);
                });

            return d.promise;
        }

        public getProjectTotals(siteUrl: string, listName: string, start: Date, end: Date, title: string, projectsListName: string): ng.IPromise<Array<IPersonProjects>> {
            var self = this;
            var d = this.$q.defer();

            start = Utils.parseDate(start);
            end = Utils.parseDate(end);

            if (this.config.debug) {
                console.info(start);
                console.info(end);
            }

            // Group the time entry data by CreatedBy, Project
            var transform = (logs: Array<SharePoint.ITimeLogItem>): void => {

                var groups: Array<IPersonProjects> = [];

                // logs is ordered by CreatedBy.Name, ProjectId, TimeIn 
                // 1. group by user
                var temp = []; //temporary tracking array
                for (var i = 0; i < logs.length; i++) {
                    var name = logs[i].CreatedBy.Name;
                    if (temp.indexOf(name) > -1) { continue; }
                    temp.push(name);
                    groups.push({
                        Name: name,
                        Title: title,
                        Projects: []
                    });                   
                }
               
                for (var i = 0; i < groups.length; i++) {
                    var group = groups[i];
                    var temp = [];

                    // 2. group by project
                    for (var j = 0; j < logs.length; j++) {
                        var p = logs[j];
                        if (p.CreatedBy.Name != group.Name || temp.indexOf(p.ProjectId) > -1) { continue; }
                        
                        temp.push(p.ProjectId);
                        var proj: IProjectTotal = {
                            Id: p.ProjectId,
                            Title: p.Project.Title,
                            TotalHours: 0,
                            PersonName: p.CreatedBy.Name,
                            SiteUrl: siteUrl,
                            ListName: projectsListName,
                            Color: null
                        };

                        // 3. sum the total hours from a person's project's entries in `logs`
                        for (var k = 0; k < logs.length; k++) {
                            var log = logs[k];
                            if (log.CreatedBy.Name == group.Name && proj.Id == log.ProjectId && !!log.TimeIn && !!log.TimeOut) {
                                proj.TotalHours += log.Hours;
                            }
                        }

                        group.Projects.push(proj);
                    }
                }

                d.resolve(groups);
            };

            // tested Odata query
            // /_vti_bin/listdata.svc/TimeLog?$expand=CreatedBy,Project&$orderby=CreatedBy/Name,ProjectId,TimeIn&$filter=TimeIn ge datetime'2015-12-07T05:00:00.000Z' and TimeIn le datetime'2015-12-11T05:00:00.000Z'&$select=CreatedBy/Name,ProjectId,TimeIn,TimeOut,Hours,Project/Title

            var startIso: string = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0).toISOString();
            var endIso: string = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 0).toISOString();

            // get data from production server
            this.getSpListItems(
            /*siteUrl:*/siteUrl,
            /*listName:*/listName, 
            /*filter:*/'TimeIn ne null and TimeOut ne null and TimeIn ge datetime\'' + startIso + '\' and TimeIn le datetime\'' + endIso + '\'',
            /*select:*/'CreatedBy/Name,ProjectId,TimeIn,TimeOut,Hours,Project/Title',
            /*orderby:*/'CreatedBy/Name,ProjectId,TimeIn',
            /*expand:*/'CreatedBy,Project',
            /*top:*/1000).then(transform);
           
            return d.promise;
        }
    }

    // Register with angular
    app.factory(Datacontext.Id, ['$http', '$q', 'common', 'config', function factory($http: any, $q: ng.IQService, common: ICommon, config: IConfiguration) {
        return new Datacontext($http, $q, common, config);
    }]);

}