var db = require("./db");


function authenticate(name, pass, req, res, fn) {
  var user;
  if (db.validate_password(name, pass)) {
    user = {login: name};
  }
  // FIXME: handle errors
  return fn(user, req, res);
}

exports.perform_login_and_redirect = function(user, req, res) {
  if (user) {
    // Regenerate session when signing in
    // to prevent fixation
    req.session.regenerate(function(){
    req.session.user = user;
    req.session.user.dashboard_url = '/me';
    var redirect = req.body.redirect || "/";
    res.redirect(redirect);
    });
  } else {
    req.session.error = 'Authentication failed, please check your '
    + ' username and password.';
    res.redirect('/login');
  }
};

exports.login = function(req, res) {
  authenticate(req.body.username, req.body.password, req, res, exports.perform_login_and_redirect);
};

exports.login_view = function(req, res) {
  res.render('misc/login', { redirect: req.params.redirect});
};

exports.logout = function(req, res) {
  // destroy the user's session to log them out
  // will be re-created next request
  req.session.destroy(function(){
    res.redirect('/');
  });
};

exports.logged_only = function(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.session.error = 'Access denied!';
    var redirect = encodeURIComponent(req.originalUrl);
    console.log("redirect= %s", redirect);
    if(redirect == "%2F")
      redirect = "";
    else
      redirect = "?redirect=" + redirect;

    res.redirect('/login' +redirect);
  }
};