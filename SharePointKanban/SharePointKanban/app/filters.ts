module App {

    app.filter('by_prop', function () {
        Utils.filterByProperty['$stateful'] = true; // enable function to wait on async data
        return Utils.filterByProperty;
    });

    app.filter('sp_date', function () {
        function fn(val) {
            if (!!!val) { return val; }
            return Utils.parseDate(val).toLocaleDateString();
        };
        fn['$stateful'] = true;
        return fn;
    });

    app.filter('sp_datetime', function () {
        function fn (val) {
            return Utils.toUTCDateTime(val);
        };
        fn['$stateful'] = true;
        return fn;
    });

    app.filter('active_tasks', function () {
        function fn(cols: Array<IKanbanColumn>): Array<SharePoint.ISpTaskItem> {
            var active = [];
            if (!!!cols) { return active; }
            for (var i = 0; i < cols.length; i++) {
                for (var j = 0; j < cols[i].tasks.length; j++) {
                    if (cols[i].tasks[j].LastTimeOut == null && cols[i].tasks[j].LastTimeIn != null) {
                        active.push(cols[i].tasks[j]);
                    }
                }
            }
            return active;
        };
        fn['$stateful'] = true;
        return fn;
    });

}