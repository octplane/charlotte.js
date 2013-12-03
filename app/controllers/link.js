var db = require("./db"),
	cheerio = require('cheerio'),
	request = require('request');



exports.post_link = function(req, res) {
	res.render('link/post_link');
};

exports.add = function(req, res) {
	request(req.query.url, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			var $ = cheerio.load(body);
			console.log($("title").text());
	 		res.render('link/add', { url: req.query.url, url_title: $("title").text()});
		} else {
			console.log(error);
		}
	});
};