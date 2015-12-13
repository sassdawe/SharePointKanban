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

    //<span style="float:right;" projects-total-hours project-groups="person.ProjectGroups"></span>
    app.directive('projectsTotalHours', ['$window', function ($window) {
        return {
            restrict: 'EA',
            scope: {
                projectGroups: '='
            },
            link: function (scope: any, elem: any, attr: any): void {
                scope.$watch(function (scope) {
                    var projectGroups: Array<IProjectGroup> = scope.projectGroups
                    var total: number = 0;
                    for (var i = 0; i < projectGroups.length; i++) {
                        for (var j = 0; j < projectGroups[i].Projects.length; j++) {
                            total += projectGroups[i].Projects[j].TotalHours;
                        }
                    }
                    scope.total = total;
                });
            },
            replace: false,
            template: 'Total Hours: {{total | number:3}}'
        }
    }]);

    app.directive('doughnutChart', doughnutChart);

    function doughnutChart() {
        return {
            restrict: 'A',
            scope: {
                projectsData: '='
            },
            link: function (scope: any, $elem: any, attr: any): void {

                scope.$watch(function (scope) {
                    var projects: Array<IProjectTotal> = scope.projectsData;
                    var chartData = [];
                    var canvasId: string = $elem[0].id;
                    var uniqueId = 'doughnut_' + canvasId;
                    var chart: any;
                    var canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById(canvasId);
                    var ctx = canvas.getContext("2d");
                    var colors = Utils.randomize(Utils.hexColors());

                    // destroy existing chart object
                    if (canvas['__chartRef']) {
                        chart = canvas['__chartRef'];
                        chart.clear();
                        chart.destroy();
                    }

                    if (typeof projects != 'undefined') {
                        projects.forEach(function (p, i) {

                            p.Color = p.Color || (i < colors.length ? colors[i] : colors[colors.length - i]);

                            chartData.push({
                                label: p.Id + ': ' + p.Title,
                                value: p.TotalHours.toFixed(3),
                                color: p.Color
                            });
                        });
                    }
              
                    //canvas['__chartRef'] = 
                    chart = new window['Chart'](ctx).Doughnut(chartData, {
                        responsive: true
                        //Boolean - Whether we should show a stroke on each segment
                        , segmentShowStroke : true

                        //String - The colour of each segment stroke
                        , segmentStrokeColor: "#ccc"

                        //Number - The width of each segment stroke
                        , segmentStrokeWidth: 1

                        //Number - The percentage of the chart that we cut out of the middle
                        , percentageInnerCutout: 50 // This is 0 for Pie charts

                        //Number - Amount of animation steps
                        , animationSteps: 100

                        //String - Animation easing effect
                        , animationEasing: "easeOutBounce"

                        //Boolean - Whether we animate the rotation of the Doughnut
                        , animateRotate: true

                        //Boolean - Whether we animate scaling the Doughnut from the centre
                        , animateScale: false
                    });
                    canvas['__chartRef'] = chart;
                });
            }
        };
    }
}