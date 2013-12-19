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

var rootPath = path.normalize(__dirname + '/../../');
var missingThumbPath = path.join(rootPath, "public/img/questionmark.jpg");

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

siteThumb = function(identifier, url, cb) {
	var thumbPath = path.join(config.db_path, "images", identifier + ".jpg");
	fs.exists(thumbPath, function(exists) {
		if (!exists && url){
			console.log("Fetching thumb for " + identifier + " at " + url);
			var options = {
				windowSize: { width: 640, height: 480}
			};
			webshot(url, thumbPath, options, function(err) {
				if(err) {
					cb && cb(err, null);
				} else {
					cb && cb(null, thumbPath);
				}
			  // screenshot now saved to google.png
			});
		}
	})
};

exports.thumb = function(req, res, next) {
	db.db.one(function (doc) { if (doc.id == req.params.id) return doc; }, function(doc) {
		if(doc && (!doc.disable_thumb_until || doc.disable_thumb_until < Date.now)) {
			console.log("Generating thumb for "+req.params.id);
			siteThumb(doc.id, doc.url, function(err, thumbPath) {
				if (!err) {
					send(req, thumbPath).pipe(res);
				} else {
					// disable thumb for 24h
					var old = doc;
					old.disable_thumb_until = Date.now() + 24 * 60 * 3600 * 1000;
					db.db.update(function (doc) { if (doc.id == old.id) return old; return doc; }, function(count) {
						db.update_views();
					}, "Disabling thumbnail for a while for " + old.url);

					console.log("Failed:" + err);
					res.status(404);
					send(req, missingThumbPath).pipe(res);
				}
			});
		} else {
			if(doc && doc.disable_thumb_until) {
				console.log("Date.now=" + Date.now() + " < " + doc.disable_thumb_until + ": Thumb disabled");
			}
			res.status(404);
			send(req, missingThumbPath).pipe(res);
		}
	});
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
