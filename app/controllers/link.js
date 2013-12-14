var db = require("./db"),
	cheerio = require('cheerio'),
	request = require('request'),
	crc32 = require('crc32'),
	btoa = require('btoa'),
	_=require("underscore");
    
smallHash = function(text) {
	var crc = crc32(text), bytes = [], hash;

	// This implementation seems to be crc32b but I don't care
	// http://stackoverflow.com/questions/15861058/what-is-the-difference-between-crc32-and-crc32b
	for(var p=0; p < crc.length; p+=2) {
		bytes.push(parseInt(crc.substr(p, 2), 16));
	}
	
	hash = btoa(String.fromCharCode.apply(String, bytes)).
		replace(/=*$/,'').
		replace(/\+/g, '-').
		replace(/\//g, '_');
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
	var post = { url: req.body.url,
		title: req.body.title,
	}
	if (req.body.tags != "")
		post.tags = _.map(req.body.tags.split(/,/),
			function(tag) {
				return tag.trim();
			});

	if (req.body.text)
		post.text = req.body.text;

	post.id = smallHash(JSON.stringify(post));
	console.log(post);
	db.db.one(function (doc) { doc.id == post.id }, function(doc) {
		// Ignore double posts with identical identifier
		// TODO: what about identical URL or whatever ?
		if (!doc) {
			post.date_created = new Date();
			post.date_updated = new Date();
			db.db.insert(post, function(count) {
				console.log("Inserted "+count+" items");
			    res.redirect('/' , {highlight: post.id});
			}, "Creating link for " + post.url);
		} else {
			console.log("Post already exists; not doing anything.");
		}
	});
};