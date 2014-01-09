// db.js

var fs = require("fs"),
  path = require("path"),
  config = require("../../config/config"),
  bcrypt = require("bcrypt"),
  security = require("./security");


var db = require('nosql').load(config.db_file);

exports.update_views = function(cb) {
  db.views.create('latest', function(d) { return d;}, function(a,b) {
    if (a.date_updated < b.date_updated)
      return 1;
    return -1;
  }, cb);
};


db.on('load', function() {
    var db = this;
    if(!db.custom() || !db.custom().configured) {
        console.log("Setting flag to False");
        db.custom({configured:false});
        exports.update_views();
    }
});


var DEFAULT_TITLE = "Charlotte";

exports.db = db;

exports.get_title = function() {
  return db.custom().title || DEFAULT_TITLE;
}

exports.validate_password = function(username, password) {
  if(db.custom().username === username)
    return bcrypt.compareSync(password, db.custom().pwd);
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

  var salt = bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(pwd1, salt, function(err, hash) {
      db.custom({configured:true, title: DEFAULT_TITLE, username: uname, pwd: hash});
      security.perform_login_and_redirect(uname, req, res);
    });
  });
}
