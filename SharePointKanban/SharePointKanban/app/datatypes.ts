module App {

    /**
    * Extends IStateParamsService to include custom url parameters for Angular UI Router states.
    */
    export interface IAppStateParams extends ng.ui.IStateParamsService {
        start: string;
        end: string;
    }
    
    export interface IKanbanConfig {
        siteUrl: string;
        listName: string;
        timeLogListName: string;
        columns: Array<IKanbanColumn>;
        statuses: Array<string>;
        previousMonths: number;
    }

    export interface IKanbanColumn {
        title: string;
        id: string;
        className: string;
        status: string;
        tasks: Array<SharePoint.ISpTaskItem>;
    }

    export interface ISpUpdateItem {
        Id: number;
        fields: Array<ISpUpdateField>;
    }

    export interface ISpUpdateField {
        name: string;
        value: any;
    }

    export interface IPersonProjects{
        Name: string;
        Title: string;
        Projects: Array<IProjectTotal>
    }

    export interface IProjectTotal {
        Id: number;
        Title: string;
        TotalHours: number;
        PersonName: string;
        Color: string;
    }

    export interface IProjectSiteConfig {
        siteUrl: string;
        listName: string;
        title: string;
    }

    export interface IPersonProjectsGroup {
        Name: string;
        ProjectGroups: Array<IProjectGroup>;
    }

    export interface IProjectGroup {
        Title: string;
        Projects: Array<IProjectTotal>;
    }

}