function UserController($scope, $http, $window, $location, $routeParams, AuthService) {
  $scope.page = 0;

  function redirectToLogin() {
    $scope.users = [];
    var returnTo = $routeParams.returnTo;
    $location.url('/login?returnTo=' + returnTo);
  }

  function handleError(data, status, headers, config) {
    if (status === 401) {
      redirectToLogin();
    } else {
      $scope.status = status + ': ' + data ? data : '';
    }
  }

  $scope.load = function (userPattern, offset, limit) {
    var accessToken = AuthService.getAccessToken();
    if (!accessToken) {
      $scope.status = 'No administrator is logged in.';
      return;
    }
    userPattern = encodeURIComponent(userPattern || '');
    var filter = {
      where: {
        or: [
          {email: {like: userPattern + '%'}},
          {username: {like: userPattern + '%'}}
        ]
      },
      offset: Number(offset) || 0
    };
    if (limit !== undefined) {
      filter.limit = Number(limit) || 100;
    }
    $http.get('/api/users?filter=' + encodeURIComponent(JSON.stringify(filter))
      + '&access_token='
      + encodeURIComponent(accessToken))
      .success(function (data) {
        $scope.users = data;
        $scope.orderProp = 'id';
      }).error(handleError);
  };

  $scope.login = function (returnTo) {
    var email = $scope.email;
    var username = $scope.username;
    if (email && email.indexOf('@') === -1) {
      username = email;
      email = null;
    }
    var credential = {
      password: $scope.password
    };
    if (email) {
      credential.email = email;
    }
    if (username) {
      credential.username = username;
    }
    $http.post('/api/users/login', credential)
      .success(function (data) {

        AuthService.setAdministrator(data.id, email || username, data.userId);
        var returnTo = $routeParams.returnTo;
        $location.path(returnTo);

      }).error(function (data, status, headers, config) {
        // console.log(status, headers);
        $scope.status = status + ': Login failed.';
      });
  };

  $scope.setUser = function (user, userId) {
    AuthService.setUser(user, userId);
  };

  $scope.isDefaultUser = function (userId) {
    var defaultUser = AuthService.getUser();
    return userId === defaultUser.userId;
  };

}