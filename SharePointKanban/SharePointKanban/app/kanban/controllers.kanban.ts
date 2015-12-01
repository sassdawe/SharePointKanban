module App.Controllers {

    export class KanbanController {

        public static Id: string = 'kanbanController';

        static $inject = ['$scope'];

        public columns: Array<IKanbanColumn>;

        private dragging: any = {};

        private $scope: any;

        constructor($scope: any) {

            this.$scope = $scope;
            this.columns = $scope.$parent.vm.columns;
            this.dragging = $scope.$parent.vm.dragging;
        }

    }

    app.controller(KanbanController.Id, KanbanController);
}