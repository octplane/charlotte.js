
var db = require('./db');

exports.ready = function(req, res, next) {
  if(db.current.custom().configured) {
    next()
  } else {
    res.render('configure');
  }
};
