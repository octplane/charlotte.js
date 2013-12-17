var db = require("./db"),
  _=require('underscore'),
  moment = require('moment');

var urlMatcher = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;

beautify = function(text) {
  var t = text.replace(/\r\n/g, "<br />");
  t = t.replace(urlMatcher,'<a href="$1" rel="nofollow">$1</a>');
  return t;
}

exports.index = function(req, res){
  // Article.find(function(err, articles){
  //   if(err) throw new Error(err);
  db.db.views.all('latest', function(selected, count) {
    _.each(selected, function(el) {
      el.since = moment(el.date_updated).fromNow();
      el.text = el.text ? beautify(el.text) : null;
    });
    console.log(selected);
    res.render('home/index', {
      title: 'Latest '+ count +' Links',
      links: selected
    });
  }, null, 1000);
  // });
};

exports.about = function(req, res) {
  var proto = req.connection.encrypted ? "https" : "http";
	var my_url = proto  + '://' + req.headers.host + '/add/';

	res.render('home/about', {
		title: 'About',
		root_url: my_url
	});
};