var app = angular.module('myApp', ['mgcrea.ngStrap', 'ngRoute']);

// configure our routes
app.config(function ($routeProvider) {
  $routeProvider

    // route for the home page
    .when('/users', {
      templateUrl: 'user-list.html',
      controller: 'UserController'
    })

    // route for the tokens page
    .when('/tokens', {
      templateUrl: 'token-list.html',
      controller: 'TokenController'
    })

    // route for the subscriptions page
    .when('/subscriptions', {
      templateUrl: 'subscription-list.html',
      controller: 'SubscriptionController'
    })

    // route for the add subscription page
    .when('/subscriptions/create/:userId', {
      templateUrl: 'subscription-create.html',
      controller: 'SubscriptionController'
    })

    // login
    .when('/login', {
      templateUrl: 'login.html',
      controller: 'UserController'
    })

    .when('/home', {
      templateUrl: 'home.html'
    })

    .otherwise({
      redirectTo: '/home'
    });
});

// create the controller and inject Angular's $scope
app.controller('MainController', function ($scope, AuthService) {

  $scope.isLoggedIn = function () {
    return !!AuthService.getAccessToken();
  };

  $scope.getAdminUser = function () {
    return AuthService.getAdminUser();
  };

  $scope.getUser = function () {
    return AuthService.getUser().user;
  };

  $scope.logout = function () {
    AuthService.clear();
  };
});

/*
 app.controller('TokenController', TokenController);
 app.controller('UserController', UserController);
 app.controller('SubscriptionController', SubscriptionController);
 */

app.run(['$rootScope', '$location', 'AuthService',
  function ($rootScope, $location, AuthService) {
    $rootScope.$on('$routeChangeStart', function (event) {
      var currentPath = $location.path();
      if (currentPath === '/' || currentPath.indexOf('/login') !== -1
        || currentPath.indexOf('/home') !== -1) {
        return;
      }
      if (!AuthService.getAccessToken()) {
        console.log('DENY');
        event.preventDefault();
        console.log(currentPath);
        $location.url('/login?returnTo=' + currentPath);
      }
      else {
        console.log('ALLOW');
      }
    });
  }]);
