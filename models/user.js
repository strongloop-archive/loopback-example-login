var loopback = require('loopback');
var app = require('../app');
var PasswordHash = require('../wp-pass');
var p = new PasswordHash(8, true);

var userModel = app.models.user;
var accessTokenModel = app.models.accessToken;
var subscriptionModel = app.models.subscription;

var excludedProperties = [
  'realm',
  'emailVerified',
  'verificationToken',
  'credentials',
  'challenges',
  'lastUpdated'
];

// Remove the properties from base User model that doesn't have mapped columns
excludedProperties.forEach(function (p) {
  delete userModel.definition.rawProperties[p];
  delete userModel.definition.properties[p];
  delete userModel.prototype[p];
});

/**
 * Customize the hasPassword implementation
 * @param {String} password
 * @callabck {Function} cb Callback function
 * @param err
 * @param yes
 */
userModel.prototype.hasPassword = function (password, cb) {
  var ok = password && p.checkPassword(password, this.password);
  process.nextTick(function () {
    cb(null, ok);
  });
};

userModel.getRelated = function (relatedModel, userNameOrEmail, where, cb) {
  if (!userNameOrEmail) {
    process.nextTick(function () {
      var err = new Error('User name or email is missing');
      err.statusCode = 400;
      cb(err);
    });
    return;
  }
  userModel.findOne({where: {or: [
      {email: userNameOrEmail},
      {username: userNameOrEmail}
    ]}},
    function (err, user) {
      if (err || !user) {
        return cb(err, []);
      }
      where = where || {};
      where.userId = user.id;
      relatedModel.find({where: where}, function (err, results) {
        if (err) {
          return cb(err);
        }
        cb(err, {
          userId: user.id,
          results: results
        });
      });
    });
};

userModel.getAccessTokens = function (userNameOrEmail, cb) {
  userModel.getRelated(accessTokenModel, userNameOrEmail, {}, cb);
};

loopback.remoteMethod(userModel.getAccessTokens, {
  description: 'List access tokens for a given username or email',
  accepts: {arg: 'user', type: 'string', description: 'User name or email', http: {source: 'path'}},
  returns: {arg: 'data', type: 'object', root: true},
  http: {verb: 'get', path: '/:user/getAccessTokens'}});

/**
 * Get subscriptions by username/email and product
 * @param {String} userNameOrEmail User name or email
 * @param {String} [product] Product name
 * @param cb
 */
userModel.getSubscriptions = function (userNameOrEmail, product, cb) {
  userModel.getRelated(subscriptionModel, userNameOrEmail, {product: product}, cb);
}

loopback.remoteMethod(userModel.getSubscriptions, {
  description: 'List subscriptions for a given username or email',
  accepts: [
    {arg: 'user', type: 'string', description: 'User name or email', http: {source: 'path'}},
    {arg: 'product', type: 'string', description: 'Product name', http: {source: 'query'}}
  ],
  returns: {arg: 'data', type: 'object', root: true},
  http: {verb: 'get', path: '/:user/getSubscriptions'}});

/*
 * Set up a hook to configure TTL based on the user id
 */
userModel.prototype.createAccessToken = function (ttl, cb) {
  var user = this;
  subscriptionModel.findOrCreate({where: {userId: user.id, product: 'studio'}},
    {
      userId: user.id,
      product: 'studio',
      level: 1,
      activationDate: new Date(),
      expirationDate: new Date(Date.now() + 1209600000) // Default to 2 weeks
    },
    function (err, subscription) {
      if (!err && subscription) {
        var d2 = subscription.expirationDate;
        if (d2) {
          ttl = (d2.getTime() - Date.now()) / 1000;
        }
      }
      user.accessTokens.create({ttl: ttl}, cb);
    });
};
