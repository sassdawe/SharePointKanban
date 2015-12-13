module App {

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

    app.directive('datePicker', ['$window', function ($window) {
        return {
            restrict: 'A',
            scope: {
                ngModel: '='
            },
            link: function (scope: any, elem: any, attr: any): void {
                // apply jQueryUI datepicker
                $(elem)['datepicker']({
                    changeMonth: true,
                    changeYear: true
                });
                scope.$watch(function (scope) {
                    var d: Date = <Date>scope.ngModel;
                    $(elem).val(moment(d).format('MM/DD/YYYY'));
                });
            }
        }
    }]);

    app.directive('totalHours', ['$window', function ($window) {
        return {
            restrict: 'EA',
            scope: {
                projects: '='
            },
            link: function (scope: any, elem: any, attr: any): void {
                scope.$watch(function (scope) {
                    var projects: Array<IProjectTotal> = scope.projects;
                    var total: number = 0;
                    for (var i = 0; i < projects.length; i++) {
                        total += projects[i].TotalHours;
                    }
                    scope.total = total;
                });
            },
            replace: true,
            template: '<strong>{{total | number:3}}</strong>'
        }
    }]);
}