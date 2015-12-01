module App {
    
    export interface IKanbanColumn {
        title: string;
        id: string;
        className: string;
        tasks: Array<SharePoint.ISpTaskItem>;
    }

}