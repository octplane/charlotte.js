var db = require("./db"),
  _ = require('underscore'),
  url = require('url'),
  moment = require('moment'),
  async = require('async'),
  fav = require('favicon');

var urlMatcher = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;

beautify = function(text) {
  var t = text.replace(/\r\n/g, "<br />");
  t = t.replace(urlMatcher,'<a href="$1" rel="nofollow">$1</a>');
  return t;
}

favicon = function(ul) {
  var u = url.parse(ul);
  return u.protocol + '//' + u.hostname + '/favicon.ico';
}

prepareForView = function(item, next) {
  item.since = moment(item.date_updated).fromNow();
  item.text = item.text ? beautify(item.text) : null;
  // fav(item.url, function(err, favicon_url) {
  //   if (!err) {
  //     console.log("Favicon: "+item.url+" -> "+ favicon_url);
  //     item.f = favicon_url;
  //   } else {
  //     console.log("Error while fetching favicon url for "+item.url);
  //     console.log(err);
  //   }
    next(null, item);
  // });
}

exports.index = function(req, res){
  // Article.find(function(err, articles){
  //   if(err) throw new Error(err);
  db.db.views.all('latest', function(selected, count) {
    async.map(selected, prepareForView, function(err, selected) {
      res.render('home/index', {
        title: 'Latest '+ count +' Links',
        links: selected
      });
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