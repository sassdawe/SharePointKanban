module App {

    app.filter('by_prop', function () {
        Utils.filterByProperty['$stateful'] = true; // enable function to wait on async data
        return Utils.filterByProperty;
    });

    app.filter('sp_date', function () {
        Utils.filterByProperty['$stateful'] = true; // enable function to wait on async data
        return Utils.parseDate;
    });

}