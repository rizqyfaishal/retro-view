var app = angular.module('app',['ui.router','ngRoute'])
    .constant('BASE_URL','/')
    .constant('RETRO_SERVICE','/')
    .config(function ($stateProvider,$urlRouterProvider,$locationProvider) {
        $locationProvider.html5Mode(true);
        $urlRouterProvider.otherwise('/');
        $stateProvider
            .state('home',{
                url: '/',
                templateUrl: '/templates/home.html'
            })
            .state('reg',{
                url: '/daftar',
                templateUrl: '/templates/reg.html',
                controller: 'RegController'
            });
    })
    .controller('RegController',function ($scope, $http) {

    });