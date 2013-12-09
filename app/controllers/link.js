var db = require("./db"),
	cheerio = require('cheerio'),
	request = require('request');



exports.post_link = function(req, res) {
	res.render('link/post_link');
};

exports.add = function(req, res) {
	if (!req.query.title) {
		request(req.query.url, function(error, response, body) {
			if (!error && response.statusCode == 200) {
				var $ = cheerio.load(body);
				console.log($("title").text());
		 		res.render('link/add', { 
		 			url: req.query.url, 
		 			url_title: $("title").text(),
		 			tags: "",
		 			description: "",
		 			in_add_sequence: true
		 		});
			} else {
				console.log(error);
			}
		});
	} else {
		res.render('link/add', { url: req.query.url, tags:"", in_add_sequence: true, description: "", url_title: req.query.title});
	}
};

exports.post = function(req, res) {
	var parms = req.body;
	console.log(parms);
	var post_identifier = "plop";
    res.redirect('/', {highlight: post_identifier});

};