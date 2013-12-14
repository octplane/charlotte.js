var db = require("./db"),
	cheerio = require('cheerio'),
	request = require('request'),
	crc32 = require('crc32'),
	btoa = require('btoa');
    
smallHash = function(text) {
	var crc = crc32(text), bytes = [], hash;

	// This implementation seems to be crc32b but I don't care
	// http://stackoverflow.com/questions/15861058/what-is-the-difference-between-crc32-and-crc32b
	for(var p=0; p < crc.length; p+=2) {
		bytes.push(parseInt(crc.substr(p, 2), 16));
	}
	
	hash = btoa(String.fromCharCode.apply(String, bytes)).replace(/=*$/,'');
	return hash;
}

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
	console.log(smallHash(req.body));
	var post_identifier = "plop";
    res.redirect('/', {highlight: post_identifier});

};