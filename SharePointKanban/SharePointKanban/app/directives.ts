﻿module App {

    app.directive('kanbanTask', function(){
        return {
            restrict: 'A',
            scope: {
                kanbanTask: '=',
                parentScope: '='
            },
            link: function(scope: any, $element: any, attrs: any) {

                scope.$watch(function (scope) {

                    // Store in parent scope a reference to the task being dragged, 
                    // its parent column array, and its index number.
                    $element.on('dragstart', function (ev) {
                        //console.info(ev.target.id);
                        scope.parentScope.dragging = {
                            task: scope.kanbanTask,
                        };
                    });

                });

            }
        }
    });

    app.directive('kanbanColumn', function(){
        return {
            restrict: 'A',
            scope: {
                kanbanColumn: '=',
                parentScope: '='
            },
            link: function(scope: any, $element: any, attrs: any) {

                scope.$watch(function (scope) {

                    // trigger the event handler when a task element is dropped over the Kanban column.
                    $element.on('drop', function (event) {
                        cancel(event);

                        var controller: Controllers.IKanbanController = scope.parentScope;
                        var task: SharePoint.ISpTaskItem = scope.parentScope.dragging.task;
                        var col: IKanbanColumn = scope.kanbanColumn;

                        if (!!task) {
                            var field: ISpUpdateField = {
                                name: 'Status',
                                value: col.status
                            };
                            task.Status.Value = col.status;
                            controller.updateTask(task.Id, field);
                            controller.dragging.task = undefined; //clear the referene so we know we're no longer dragging
                        }

                    }).on('dragover', function (event) {
                        cancel(event);
                    });

                });

                // Cross-browser method to prevent the default event when dropping an element.
                function cancel(event) {
                    if (event.preventDefault) {
                        event.preventDefault();
                    }

                    if (event.stopPropagation) {
                        event.stopPropagation();
                    }
                    return false;
                }

            }
        }
    });

}