
function authenticate(name, pass, fn) {
  console.log('authenticating %s:%s', name, pass);
  var user = users[name];
  // query the db for the given username
  if (!user) {
    console.log("User %s not found.", name);
    return fn(new Error('cannot find user'));
  }
  user.login = name;
  // apply the same algorithm to the POSTed password, applying
  // the hash against the pass / salt, if there is a match we
  // found the user
  return fn(null, user);
}

exports.login = function(req, res) {
  authenticate(req.body.username, req.body.password, function(err, user) {
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
      res.redirect('login');
    }
  });
};

exports.login_view = function(req, res) {
  res.render('login', { redirect: req.params.redirect});
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