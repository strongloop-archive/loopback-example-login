var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
var app = require('./app');

var PasswordHash = require('./wp-pass');
var p = new PasswordHash(8, true);

passport.use(new LocalStrategy(
  {
    usernameField: 'username',
    passwordField: 'password',
    session: true
  },
  function(username, password, done) {
    var query = {where: {or: [{username: username}, {email: username}]}};
    app.models.user.findOne(query, function(err, user) {
      if(err) {
        console.error(err);
        return done(err);
      }
      var ok = user && p.checkPassword(password, user.password);
      if(ok) {
        var u = user.toJSON();
        delete u.password;
        var userProfile = {
          provider: 'local',
          id: u.id,
          username: u.username,
          displayName: u.displayName,
          emails: [
            {
              value: u.email
            }
          ],
          url: u.url,
          registered: u.registered,
          activationKey: u.activationKey,
          status: u.status
        };

        return app.models.userIdentity.login('local', 'oAuth 2.0', userProfile,
          {}, done);

      } else {
        if(!user) {
          return done(null, false, { message: 'Incorrect username.' });
        } else {
          return done(null, false, { message: 'Incorrect password.' });
        }
      }
    });
  }
));

app.post('/auth/local',
  passport.authenticate('local', { successRedirect: '/auth/account',
    failureRedirect: '/auth/local',
    failureFlash: true })
);

app.get('/auth/local', function(req, res, next) {
  res.render('login', {});
});