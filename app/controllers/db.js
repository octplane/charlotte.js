// db.js

var fs = require("fs"),
  path = require("path"),
  security = require("./security");

var db_path = path.join( process.env['CHARLOTTE_DB_PATH'] ||
  process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'],
  ".charlotte/");

var db_file = path.join(db_path, "db.nosql");

if(!fs.existsSync(db_path)) {
  console.log("Creating folder %s...", db_path);
  fs.mkdirSync(db_path, "0700");
}

var db = require('nosql').load(db_file);

db.on('load', function() {
    var db = this;
    console.log(db.custom());
    if(!db.custom() || !db.custom().configured) {
        console.log("Setting flag to False");
        db.custom({configured:false});
    }
});


exports.validate_password = function(username, password) {
  if(db.custom()) {
    console.log(db.custom());
    console.log(db.custom().username === username);

    if(db.custom().username === username)
      return db.custom().plaintext_pwd === password;
  }
  return false;
};

// If the database is ready, jump to next view. Or else jump to configuration view.
exports.connect = function(req, res, next) {
  res.locals.links_count = 12;
  var canProceed = db.custom().configured || (req.method == "POST" && req.url == "/configure");
  if(canProceed) {
    next();
  } else {
    res.render('misc/configure', {username: null});
  }
};

exports.configure = function(req, res) {
  console.log(req.body);
  var uname = req.body.username;
  var pwd1 = req.body.password;
  var pwd2 = req.body.password_again;
  var msg = null;

  if(uname == "")
    msg = "<b>Error!</b> Please use some username.";
  else if(pwd1 != pwd2)
    msg = "<b>Error!</b> The two passwords must match.";

  if(msg)
    res.render('misc/configure', {message: msg, username:uname});

  db.custom({configured:true, username: uname, plaintext_pwd:pwd1});
  db.insert({ firstName: 'Juraj', lastName: 'Hundo', age: 28 });

  console.log(db.custom())
  security.perform_login_and_redirect(uname, req, res);

}