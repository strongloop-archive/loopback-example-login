function SubscriptionController($scope, $http, $location, $window, $routeParams, AuthService) {
  $scope.product = 'studio';
  $scope.level = 1;
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
      $http.get('/api/subscriptions?access_token=' + accessToken)
        .success(function (data) {
          $scope.subscriptions = data.map(function (t) {
            return new TokenView(t);
          });
          $scope.orderProp = 'userId';
        }).error(handleError);
    }
  };

  $scope.deleteSubscriptions = function (userId) {
    var accessToken = AuthService.getAccessToken();
    if (accessToken) {
      $http.delete('/api/users/' + encodeURIComponent(userId)
        + '/subscriptions?access_token=' + accessToken)
        .success(function (data) {
        }).error(handleError);
    }
  };

  $scope.getSubscriptions = function (user) {
    var accessToken = AuthService.getAccessToken();
    if (accessToken) {
      $http.get('/api/users/' + encodeURIComponent(user)
        + '/getSubscriptions?access_token=' + accessToken)
        .success(function (data) {
          AuthService.setUser(user, data.userId);
          $scope.subscriptions = data.results;
          $scope.userId = data.userId;
          $scope.status = data.results.length + ' subscriptions loaded for user ' + user;
        }).error(handleError);
    }
  };

  $scope.deleteSubscription = function (index, id) {
    var accessToken = AuthService.getAccessToken();
    if (accessToken) {
      $http.delete('/api/subscriptions/'
        + encodeURIComponent(id) + '?access_token='
        + accessToken).success(function (data, status, headers) {
        $scope.subscriptions.splice(index, 1);
        $scope.status = 'Subscription deleted: ' + id + ' status: ' + status;
      }).error(handleError);
    }
  };

  $scope.updateSubscription = function (index, id) {
    var accessToken = AuthService.getAccessToken();
    if (accessToken) {
      var subscription = $scope.subscriptions[index];
      $http.put('/api/subscriptions/'
        + encodeURIComponent(id) + '?access_token='
        + accessToken, subscription).success(function (data, status, headers) {
        $scope.status = 'Subscription updated: ' + id + ' status: ' + status;
      }).error(handleError);
    }
  };

  $scope.createSubscription = function () {
    var userId = $routeParams.userId;
    var accessToken = AuthService.getAccessToken();
    if (accessToken) {
      $http.post('/api/subscriptions?access_token=' + accessToken,
        {
          userId: userId,
          product: $scope.product,
          level: Number($scope.level),
          activationDate: $scope.activationDate,
          expirationDate: $scope.expirationDate
        })
        .success(function (data, status, headers) {
          $scope.status = 'Subscription created: ' + data.id + ' status: ' + status;
        }).error(handleError);
    }
  };

  $scope.getUser = function() {
    return AuthService.getUser();
  };

}