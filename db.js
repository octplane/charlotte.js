// db.js

var fs = require("fs");
var path = require("path");

var db_path = path.join( process.env['CHARLOTTE_DB_PATH'] ||
  process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'],
  ".charlotte/");

var db_file = path.join(db_path, "db.nosql");

if(!fs.existsSync(db_path)) {
  console.log("Creating folder %s...", db_path);
  fs.mkdirSync(db_path, "0700");
}

var nosql = require('nosql').load(db_file);

nosql.custom({configured:true});

exports.current = nosql;