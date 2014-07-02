var app = require('../app');

// Admin users
var adminUsers = require('../config/users.json').admins;

app.models.role.findOrCreate({where: {name: 'admin'}}, {name: 'admin'},
  function (err, role) {
    if (err) {
      return console.error(err);
    }
    // role.principals() doesn't work here as the role.id might have a different
    // type than roleMapping.roleId
    app.models.roleMapping.find({where: {roleId: role.id.toString()}},
      function (err, principals) {
        if (err) {
          return console.error(err);
        }
        var mapping = {};
        principals.forEach(function (p) {
          if (p.principalType === 'USER') {
            mapping[p.principalId] = p;
          }
        });
        app.models.user.find({where: {email: {inq: adminUsers}}},
          function (err, users) {
            if (err) {
              return console.error(err);
            }
            if (users && users.length) {
              users.forEach(function (user) {
                if (mapping[user.id.toString()]) {
                  console.log('User %s (%s) found in role %s', user.username,
                    user.email, role.name);
                  return;
                }
                role.principals.create({principalType: 'USER', principalId: user.id},
                  function (err, mapping) {
                    if (err) {
                      return console.error(err);
                    }
                    console.log('User %s (%s) added to role %s', user.username,
                      user.email, role.name);
                  });
              });
            }
          });
      }
    )
    ;
  });
