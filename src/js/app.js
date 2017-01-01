var app = angular.module('app',['ui.router','ngRoute'])
    .constant('BASE_URL_SERVICE','http://localhost:3000')
    .constant('RETRO_SERVICE_REGISTER','/peserta/register')
    .constant('AccessLevel',{
        nonAuth: 1,
        openAuth: 3,
        auth: 2
    })
    .run(function ($rootScope,$state,AdminFactory,AccessLevel, AuthTokenFactory) {
        $rootScope.$on('$stateChangeStart',function (e, toState, toParams, fromState, fromParams) {
            if(!AdminFactory.authorize(toState.data.access)){
                e.preventDefault();
                $state.go('static.login');
            } else if(toState.data.access == AccessLevel.openAuth && AuthTokenFactory.getToken()){
                e.preventDefault();
                $state.go('admin.dashboard');
            }
        });
        $rootScope.$on('$stateChangeError',function (e) {
            e.preventDefault();
            alert('Error');
        });
        $rootScope.$on('$stateChangeSuccess',function () {
            document.title = $state.current.title;
        });
    })
    .factory('AuthTokenFactory',function ($window) {
        return {
            key: 'auth-token',
            storage: $window.localStorage,
            setToken: function (token) {

                if(token){
                    this.storage.setItem(this.key,token);
                } else {
                    this.storage.removeItem(this.key);
                }
            },
            getToken: function () {
                return this.storage.getItem(this.key);
            }
        }
    })
    .factory('AuthInterceptor',function (AuthTokenFactory) {
        return {
            request: function (config) {
                var token = AuthTokenFactory.getToken();
                if(token){
                    config.headers = config.headers || {};
                    config.headers.Authorization = token;
                }
                return config;
            }
        }
    })
    .factory('CollectionData',function (BASE_URL_SERVICE,$http,$q) {
        var defer = $q.defer();
        $http.get(BASE_URL_SERVICE + '/admin/getData').then(function (data) {
            defer.resolve(data);
        });
        return defer.promise;
    })
    .factory('AdminFactory',function (AuthTokenFactory, $http, $q, BASE_URL_SERVICE, AccessLevel) {
        return {
            authorize: function (access) {
                if(access == AccessLevel.auth){
                    return AuthTokenFactory.getToken() ;
                } else {
                    return true;
                }
            },
            login: function (user) {
                var defer = $q.defer();
                $http.post(BASE_URL_SERVICE + '/admin/login',user).then(function (data) {
                    defer.resolve(data);
                });
               return defer.promise;
            },
            logout: function () {
                AuthTokenFactory.setToken();
            }
        }
    })
    .config(function ($httpProvider) {
        $httpProvider.interceptors.push('AuthInterceptor');
    })
    .config(function ($stateProvider,$urlRouterProvider,$locationProvider,AccessLevel) {
        $urlRouterProvider.otherwise('/');
        $stateProvider
            .state('admin',{
                abstract: true,
                template: '<ui-view></ui-view>',
                data: {
                    access: AccessLevel.auth
                }
            })
            .state('static',{
                abstract: true,
                template: '<ui-view></ui-view>',
                data: {
                    access: AccessLevel.nonAuth
                }
            })
            .state('admin.dashboard',{
                url: '/admin/dashboard',
                title: 'Dashboard',
                templateUrl: '/templates/dashboard.html',
                controller: 'DashboardController'
            })
            .state('static.login',{
                url: '/login',
                title: 'Login',
                templateUrl: '/templates/login.html',
                controller: 'LoginController',
                data: {
                    access: AccessLevel.openAuth
                }
            })
            .state('static.home',{
                title: 'Home Page',
                url: '/',
                templateUrl: '/templates/home.html'
            })
            .state('static.reg',{
                title: 'Register',
                url: '/daftar',
                templateUrl: '/templates/reg.html',
                controller: 'RegController'
            })
            .state('static.confirm',{
                url: '/confirm',
                title: 'Konfirmasi Pembayaran',
                templateUrl: '/templates/confirm.html',
                controller: 'ConfirmController'
            })
            .state('static.check',{
                url: '/check',
                title: 'Check Pembayaran',
                templateUrl: '/templates/check.html',
                controller: 'CheckController'
            })
            .state('static.success_template',{
                title: 'Sukses',
                url: '/berhasil',
                templateUrl: '/templates/success_template.html',
                controller: 'SuccessController'
            })
            .state('static.result',{
                title: 'Result',
                url: '/result',
                templateUrl: '/templates/check_result.html',
                controller: 'ResultController'
            })
            .state('static.success',{
                title: 'Pendaftaran Sukses',
                url: '/success',
                templateUrl: '/templates/success.html',
                controller: 'SuccessController'
            });
    })
    .controller('SuccessController',function ($scope, $rootScope) {
        $scope.uuid = $rootScope.data.uuid;
    })
    .controller('RegController',function ($scope, $http, RETRO_SERVICE_REGISTER, BASE_URL_SERVICE,$q,$state,$rootScope) {
        var defer = $q.defer();

        $scope.process = false;
        $scope.submit = function (user) {
            $scope.process = true;
            $http.post(BASE_URL_SERVICE + RETRO_SERVICE_REGISTER,user).then(function (data) {
                defer.resolve(data);
            })
        };

        defer.promise.then(function (data) {
            if(data){
                $scope.process = false;
                $rootScope.data = data.data;
                $state.go('static.success');
            }
        });
    })
    .controller('LoginController',function (AdminFactory, $scope, AuthTokenFactory, $state) {
        $scope.login = function (user) {
            AdminFactory.login(user).then(function (data) {
                if(data.data){
                    AuthTokenFactory.setToken(data.data);
                    $state.go('admin.dashboard');
                }
            });
        }

    })
    .controller('DashboardController',function ($scope, AdminFactory, $state, CollectionData) {
        $scope.controls = {
            no: true,
            uuid: true,
            name: true,
            gender: true,
            email: true,
            phone: true,
            school: true,
            type: true,
            createdAt: true,
            payment: true,
            enter: true
        };
        $scope.toggle = function (a) {
            a = !a;
        };
        $scope.logout = function () {
            AdminFactory.logout();
            $state.go('static.login');
        };

        CollectionData.then(function (data) {
            console.log(data);
            $scope.data = data.data;
        })
    })
    .controller('SuccessController',function ($scope,$rootScope) {
        $scope.message = $rootScope.message;
        $scope.subMessage = $rootScope.subMessage;
    })
    .controller('ResultController',function ($scope, $rootScope) {
        $scope.message = $rootScope.data;
    })
    .controller('CheckController',function ($scope, BASE_URL_SERVICE, $http, $q, $state,$rootScope) {
        $scope.cek = function (user) {
            var defer = $q.defer();
            $http.get(BASE_URL_SERVICE + '/peserta/check/' + user.uuid).then(function (data) {
                defer.resolve(data);
            });
            defer.promise.then(function (data) {
                console.log(data);
                $rootScope.data = data.data;
                $state.go('static.result');
            });
        };
    })
    .controller('ConfirmController',function ($scope, BASE_URL_SERVICE, $http, $q, $state, $rootScope) {
        $scope.process = false;
        $scope.send = function (confirm) {
            $scope.process = !$scope.process;
            var defer = $q.defer();
            $http.post(BASE_URL_SERVICE + '/peserta/confirm',confirm).then(function (data) {
                defer.resolve(data);
            });

            defer.promise.then(function (data) {
                console.log(data);
                $scope.process = !$scope.process;
                if(data.data.message == 'found'){
                    $rootScope.message = 'Anda telah melakukan konfirmasi pembayaran sebelumnya';
                    $rootScope.subMessage = true;
                    $state.go('static.success_template');
                } else {
                    $rootScope.message = 'Konfirmasi Pembayaran telah dikirimkan';
                    $rootScope.subMessage = null;
                    $state.go('static.success_template');
                }
            });
        };
    });