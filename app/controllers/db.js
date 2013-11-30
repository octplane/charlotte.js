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

var db = require('nosql').load(db_file);

if(!db.custom() || !db.custom().configure) {
	console.log("Setting unconfigured flag");
	db.custom({configured:false});
}
exports.current = db;

// If the database is ready, jump to next view. Or else jump to configuration view.
exports.ready = function(req, res, next) {
  if(db.custom().configured) {
    next()
  } else {
    res.render('misc/configure');
  }
};

exports.configure = function(req, res) {
  console.log(req.body.username);
  var msg = 'Passwords plop';
  res.render('misc/configure', {message: msg});
}