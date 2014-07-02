app.service('AuthService', ['$http', '$window', function ($http, $window) {
  return new AuthService($http, $window);
}]);

function AuthService($http, $window) {
  this.$window = $window;
  this.$http = $http;
}

AuthService.prototype.getAccessToken = function () {
  var accessToken = this.getItem('accessToken');
  return accessToken && encodeURIComponent(accessToken);
}

AuthService.prototype.setAdministrator = function (accessToken, adminUser, adminUserId) {
  this.setItems({
    accessToken: accessToken,
    adminUser: adminUser,
    adminUserId: adminUserId
  });
};

AuthService.prototype.setItem = function (key, value) {
  this[key] = value;
  this.$window.sessionStorage.setItem(key, value);
}

AuthService.prototype.setItems = function (obj) {
  for (var key in obj) {
    this.setItem(key, obj[key]);
  }
};

AuthService.prototype.getItems = function (keys) {
  var self = this;
  var items = {};
  keys.forEach(function (key) {
    items[key] = self.getItem(key);
  });
  return items;
};

AuthService.prototype.getItem = function (key) {
  if (!this[key]) {
    this[key] = this.$window.sessionStorage.getItem(key);
  }
  return this[key];
}

AuthService.prototype.getAdminUser = function () {
  return this.getItem('adminUser');
};

AuthService.prototype.getAdministrator = function () {
  return this.getItems(['accessToken', 'adminUser', 'adminUserId']);
};

AuthService.prototype.setUser = function (user, userId) {
  this.setItems({user: user, userId: userId});
};

AuthService.prototype.getUser = function () {
  return this.getItems(['user', 'userId']);
};

AuthService.prototype.clear = function () {
  this.userId = null;
  this.user = null;

  this.accessToken = null;
  this.adminUser = null;
  this.adminUserId = null;

  this.$window.sessionStorage.clear();
}