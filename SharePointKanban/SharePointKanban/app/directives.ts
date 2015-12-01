module App {

    app.directive('kanbanTask', function(){
        return {
            restrict: 'A',
            scope: {
                kanbanTask: '=',
                column: '=',
                index: '=',
                parentScope: '='
            },
            link: function(scope: any, $element: any, attrs: any) {

                // Store in parent scope a reference to the task being dragged, 
                // its parent column array, and its index number.
                $element.on('dragstart', function (event) {
                    scope.parentScope.dragging = {
                        task: scope.kanbanTask,
                        index: scope.index,
                        col: scope.column
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

                    var result = scope.kanbanColumn.tasks.unshift(scope.parentScope.dragging.task);

                    // slice the task off the task list we moved it from
                    if (result > 0) {
                        Utils.remove(scope.parentScope.dragging.col.tasks, scope.parentScope.dragging.index);
                        $element.prepend(document.getElementById('task_' + scope.parentScope.dragging.task.Id));
                    }

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