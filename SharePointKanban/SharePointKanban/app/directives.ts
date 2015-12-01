module App {

    app.directive('kanbanTask', function(){
        return {
            restrict: 'A',
            scope: {
                kanbanTask: '=',
                parentScope: '='
            },
            link: function(scope: any, $element: any, attrs: any) {

                // Store in parent scope a reference to the task being dragged, 
                // its parent column array, and its index number.
                $element.on('dragstart', function (event) {
                    scope.parentScope.dragging = {
                        task: scope.kanbanTask,
                    };
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

                // trigger the event handler when a task element is dropped over the Kanban column.
                $element.on('drop', function (event) {
                    cancel(event);
                    scope.parentScope.updateTaskStatus(scope.parentScope.dragging.task.Id, scope.kanbanColumn.status);

                }).on('dragover', function (event) {
                    cancel(event);
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