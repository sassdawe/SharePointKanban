module App {

    app.run(['$rootScope', '$state', '$stateParams', function run($rootScope, $state, $stateParams) {

        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;

        // jumpstart the routes
        $state.go('app.home');

    }]);

}