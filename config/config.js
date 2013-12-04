var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    fs = require('fs'),
    env = process.env.NODE_ENV || 'development';

var db_path = path.join( process.env['CHARLOTTE_DB_PATH'] ||
      process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'],
      ".charlotte/");

var db_file = path.join(db_path, "db.nosql");

if(!fs.existsSync(db_path)) {
  console.log("Creating folder %s...", db_path);
  fs.mkdirSync(db_path, "0700");
}

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

config[env].db_path = db_path;
config[env].db_file = db_file;


module.exports = config[env];
