var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'charlotte-js'
    },
    port: 3000,
    db: 'mongodb://localhost/charlotte-js-development'
  },

  test: {
    root: rootPath,
    app: {
      name: 'charlotte-js'
    },
    port: 3000,
    db: 'mongodb://localhost/charlotte-js-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'charlotte-js'
    },
    port: 3000,
    db: 'mongodb://localhost/charlotte-js-production'
  }
};

module.exports = config[env];
