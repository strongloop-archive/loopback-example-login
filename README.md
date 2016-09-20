DEPRECATED AS OF 2016-09-19

---

# loopback-example-login

The module demonstrates how to use LoopBack to: 

1. Integrate with an existing WordPress user datatbase to provide user and access token management.

2. Develop an AngularJS based admin console UI to manage user registrations, subscriptions and access tokens.

## Set up database connections

Open datasources.json and update the 'db' and 'mysql' properties:

```json
{
  "db": {
    "defaultForType": "db",
    "connector": "mongodb"
  },
  ...
  "mysql": {
    "connector": "mysql",
    "host": "localhost",
    "port": 3306,
    "database": "wordpress",
    "username": "your-user",
    "password": "your-password"
  }
}
```
