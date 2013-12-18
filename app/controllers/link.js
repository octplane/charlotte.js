var db = require("./db"),
	cheerio = require('cheerio'),
	request = require('request'),
	crc32 = require('crc32'),
	btoa = require('btoa'),
	_=require("underscore"),
	webshot = require('webshot'),
	path = require('path'),
	fs = require('fs'),
	send = require('send'),
	config = require("../../config/config");

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
};

siteThumb = function(identifier, url) {
	var p = path.join(config.db_path, "images", identifier + ".jpg");
	fs.exists(p, function(exists) {
		console.log(exists +  " " + url);
		if (!exists && url){
			console.log("Fetching thumb for " + identifier + " at " + url);
			webshot(url, p, function(err) {
				if(err) {
					console.log("Something went wrong while fetching "+identifier+" snapshot.");
					console.log(err);
				} else {
					console.log("Gor snapshot for " + identifier);
				}
			  // screenshot now saved to google.png
			});
		}
	})
	return p;
};

exports.thumb = function(req, res) {
	var id = req.params.id;

	if ('GET' != req.method && 'HEAD' != req.method) res.render(403, "Go away");
	var path = siteThumb(id);

	function error(err) {
	  if (404 == err.status) res.send(404, "Missing");
	}

	send(req, path)
	  //.maxage(options.maxAge || 0)
	  // .root(root)
	  // .index(options.index || 'index.html')
	  // .hidden(options.hidden)
	  .on('error', error)
	  .pipe(res);
};

exports.post_link = function(req, res) {
	res.render('link/post_link');
};

exports.add = function(req, res) {
	if (!req.query.title) {
		request(req.query.url, function(error, response, body) {
			console.log(response.statusCode);
			if (!error && response.statusCode == 200) {
				var $ = cheerio.load(body);
		 		res.render('link/add', {
		 			url: req.query.url,
		 			url_title: $("title").text(),
		 			tags: "",
		 			description: "",
		 			in_add_sequence: true,
		 			in_update_sequence: false
		 		});
			} else {
				res.render('link/add', {
					url: req.query.url,
					url_title: "Unable to fetch title",
					tags: "",
					description: "",
					in_add_sequence: true,
					in_update_sequence: false
				});
			}
		});
	} else {
		res.render('link/add', { url: req.query.url, tags:"", in_add_sequence: true, in_update_sequence: false, description: "", url_title: req.query.title});
	}
};

exports.edit = function(req, res) {
	db.db.one(function (doc) { if (doc.id == req.params.id) return doc; }, function(doc) {
		if(doc) {
			res.render('link/add', {
				id: doc.id,
				url: doc.url,
				url_title: doc.title,
				tags: (doc.tags && doc.tags.join(" "))|| "",
				description: doc.text && doc.text || "",
				in_update_sequence: true
			});

		} else {
			res.send(404, 'Sorry, we cannot find that!');
		}
	});
}

exports.post = function(req, res) {
	var parms = req.body;
	var post = { url: req.body.url,
		title: req.body.title,
	}
	if (req.body.tags != "")
		post.tags = _.map(req.body.tags.split(/ /),
			function(tag) {
				return tag.trim();
			});

	if (req.body.text)
		post.text = req.body.text;

	post.date_updated = new Date();


	if (req.body.id == null) {
		post.date_created = new Date();
		post.id = smallHash(JSON.stringify(post));
		siteThumb(post.id, post.url);
		db.db.insert(post, function(count) {
				db.update_views();
				res.redirect('/#highlight='+post.id);
		}, "Creating link for " + post.url);
	} else {
		post.id = req.body.id;
		console.log("plop");
		console.log(post);
		console.log("plip");
		siteThumb(post.id, post.url);
		db.db.update(function (doc) { if (doc.id == post.id) return post; return doc; }, function(count) {
				db.update_views();
		    res.redirect('/#highlight='+post.id);
		}, "Updating link for " + post.url);
	}
};
