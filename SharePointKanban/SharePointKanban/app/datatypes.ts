module App {
    
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
        Projects: Array<IProjectTotal>
    }

    export interface IProjectTotal {
        Id: number;
        Title: string;
        TotalHours: number;
    }

}