function TokenController($scope, $http, $window, $location, AuthService) {

  $scope.email = AuthService.getUser().user;

  function handleError(data, status, headers, config) {
    $scope.status = status + ': ' + data ? data : '';
  }

  function TokenView(token) {
    this.id = token.id;
    this.userId = token.userId;
    this.created = new Date(token.created);
    this.expired = new Date(this.created.getTime() + token.ttl * 1000);
  }

  TokenView.prototype.toToken = function () {
    return {
      id: this.id,
      userId: this.userId,
      ttl: (this.expired.getTime() - this.created.getTime()) / 1000,
      created: this.created
    };
  };

  $scope.load = function () {
    var accessToken = AuthService.getAccessToken();
    if (accessToken) {
      $http.get('/api/accessTokens?access_token=' + accessToken)
        .success(function (data) {
          $scope.tokens = data.map(function (t) {
            return new TokenView(t);
          });
          $scope.orderProp = 'userId';
          $scope.status = data.results.length + ' tokens loaded';
        }).error(handleError);
    }
  };

  $scope.deleteAccessTokens = function (userId) {
    var accessToken = AuthService.getAccessToken();
    if (accessToken) {
      $http.delete('/api/users/' + encodeURIComponent(userId)
        + '/accessTokens?access_token=' + accessToken)
        .success(function (data) {
        }).error(handleError);
    }
  };

  $scope.getAccessTokens = function (user) {
    var accessToken = AuthService.getAccessToken();
    if (accessToken) {
      $http.get('/api/users/' + encodeURIComponent(user)
        + '/getAccessTokens?access_token=' + accessToken)
        .success(function (data) {
          AuthService.setUser(user, data.userId);
          $scope.tokens = data.results.map(function (t) {
            return new TokenView(t);
          });
          $scope.status = data.results.length + ' tokens loaded for user ' + user;
        }).error(handleError);
    }
  };

  $scope.deleteAccessToken = function (index, id) {
    var accessToken = AuthService.getAccessToken();
    if (accessToken) {
      if (accessToken === encodeURIComponent(id)) {
        $scope.status = 'The access token cannot be deleted as it is used by the current session.';
        return;
      }
      $http.delete('/api/accessTokens/'
        + encodeURIComponent(id) + '?access_token='
        + accessToken).success(function (data, status, headers) {
        $scope.tokens.splice(index, 1);
        $scope.status = 'Record deleted: ' + id + ' status: ' + status;
      }).error(handleError);
    }
  };

  $scope.updateAccessToken = function (index, id) {
    var accessToken = AuthService.getAccessToken();
    if (accessToken) {
      var ttl = ($scope.tokens[index].expired.getTime() - $scope.tokens[index].created.getTime()) / 1000;
      $http.put('/api/accessTokens/'
        + encodeURIComponent(id) + '?access_token='
        + accessToken, {ttl: ttl}).success(function (data, status, headers) {
        $scope.status = 'Record updated: ' + id + ' status: ' + status;
      }).error(handleError);
    }
  };

}