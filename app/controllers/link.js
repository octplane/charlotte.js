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
	config = require("../../config/config"),
	link = require("../models/link"),
	ico = require('ico-ico');


var rootPath = path.normalize(__dirname + '/../../');

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

fetchThumb = function(url, outPath, cb) {
	var options = {
		windowSize: { width: 640, height: 480}
	};
	webshot(url, outPath, options, function(err) {
		console.log("Wrote to " + outPath);
		if(err) {
			cb && cb(err, null);
		} else {
			cb && cb(null, outPath);
		}
	});
}

fetchFavicon = function(url, outPath, cb) {
	ico(url, function(err, furl) {
		if (!err) {
			if (furl) {
				console.log("Fetching "+furl);
				request({uri: furl, encoding: null}, function(err, res, body) {
					if (!err && res.statusCode == 200) {
						fs.writeFile(outPath, body, null, function(err) {
							if (err) {
								console.log("Something went wrong while saving " + furl + " to " + outPath);
								console.log(err);
								cb && cb(err, null);
							} else {
								console.log("Wrote to "+outPath);
								cb && cb(null, outPath);
							}
						});
					} else {
						console.log("Error while fetching favicon (" + res.statusCode + ")");
						console.log(err);
						cb && cb("Irk", null);
					}
				});
			} else {
				console.log("Failed finding favicon for "+url)
				cb && cb(null, null);
			}
		} else {
			console.log("ico, failed" + err);
			cb(err, null);
		}
	});
}

fetchImage = function(doc, type, outPath, fetchMethod, cb) {
	if (doc.url){
		console.log("Fetching " + type + " for " + doc.id + " at " + doc.url + " into " + outPath);
		fetchMethod(doc.url, outPath, cb);
	} else {
		cb && cb(null, null);
	}
};

update_image_for_type = function(req, res, outPath, type, fetchMethod) {
	console.log("Looking for " + outPath);

	fs.exists(outPath, function(exists) {
		var missingThumbPath = path.join(rootPath, "public/img/missing_" + type + ".jpg");
		if (!exists) {
			var disable_type = "disable_" + type + "_until";
			db.db.one(function (doc) { if (doc.id == req.params.id) return doc; }, function(doc) {
				if(doc && (!doc[disable_type] || doc[disable_type] < Date.now)) {
					fetchImage(doc, type, outPath, fetchMethod, function(err, imagePath) {
						if (err) {
							// disable thumb for 1h
							var old = doc;
							old[disable_type] = Date.now() + 3600 * 1000;
							db.db.update(function (doc) { if (doc.id == old.id) return old; return doc; }, function(count) {
								db.update_views();
							}, "Disabling thumbnail for a while for " + old.url);
							console.log("Failed:" + err);
						}
					});
				} else {
					if(doc && doc[disable_type]) {
						console.log("Date.now=" + Date.now() + " < " + doc[disable_type] + ": Thumb disabled for " +  doc.url);
					}
				}
			});
			res.status(404);
			send(req, missingThumbPath).pipe(res);
		} else {
			send(req, outPath).pipe(res);
		}
	});
}

var defaultParams = {
	'link/add' : {
		title: "Add a new link",
		in_update_sequence: false,
		in_add_sequence: true,
		deletable: false,
		id: null,
		tags: "",
		description: ""
	}
}

paramsForView = function(view, params) {
	var p = {}
	_.extend(p, defaultParams[view], params);
	return p;
};

exports.thumb = function(req, res) {
	var outPath = link.thumbPath(req.params.id);
	update_image_for_type(req, res, outPath,  "thumb", fetchThumb);
};

exports.ico = function(req, res) {
	var outPath = link.icoPath(req.params.id);
	update_image_for_type(req, res, outPath, "favicon", fetchFavicon);
};


exports.post_link = function(req, res) {
	res.render('link/post_link');
};

exports.add = function(req, res) {
	if (!req.query.title) {
		request(req.query.url, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				var $ = cheerio.load(body);
		 		res.render('link/add',
		 			paramsForView('link/add', {
			 			url: req.query.url,
			 			url_title: $("title").text()
			 		}));
			} else {
				console.log(err);
				res.render('link/add',
					paramsForView('link/add', {
						url: req.query.url,
						url_title: "Unable to fetch title"
					}));
			}
		});
	} else {
		res.render('link/add',
			paramsForView('link/add',
				{ url: req.query.url, url_title: req.query.title}));
	}
};

exports.edit = function(req, res) {
	db.db.one(function (doc) { if (doc.id == req.params.id) return doc; }, function(doc) {
		if(doc) {
			res.render('link/add',
				paramsForView('link/add', {
					id: doc.id,
					url: doc.url,
					url_title: doc.title,
					tags: (doc.tags && doc.tags.join(" "))|| "",
					description: doc.text && doc.text || "",
					title: "Edit " + doc.title,
					deletable: true,
					in_add_sequence: false,
					in_update_sequence: true
				}));
		} else {
			res.send(404, 'Sorry, we cannot find that!');
		}
	});
}

exports.del = function(req, res) {
	var id = req.body.id;
	db.db.remove(function(doc) {
		return (doc.id === id);
	}, function() {
		fs.unlink(link.thumbPath(id), function(err) {
			if (err) throw err;
			fs.unlink(link.icoPath(id), function(err) {
				if (err) throw err;
				db.update_views(function() {
					res.redirect('/');
				});
			});
		});
	});
}

exports.post = function(req, res) {
	var parms = req.body;
	console.log(parms);
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
		db.db.insert(post, function(count) {
				db.update_views();
				res.redirect('/#highlight='+post.id);
		}, "Creating link for " + post.url);
	} else {
		post.id = req.body.id;
		db.db.update(function (doc) { if (doc.id == post.id) return post; return doc; }, function(count) {
				db.update_views();
		    res.redirect('/#highlight='+post.id);
		}, "Updating link for " + post.url);
	}
};

var RSS = require('rss');
var async = require('async');
exports.rss = function(req, res) {

	var proto = req.connection.encrypted ? "https" : "http";
	var site_url = proto  + '://' + req.headers.host + '/';
	var feed_url = site_url + 'rss';
	var feed = new RSS({
		title: db.get_title(),
		generator: "Charlotte.js",
		site_url: site_url,
		feed_url: feed_url});

	db.db.views.all('latest', function(selected, count) {
		async.map(selected, prepareForView, function(err, selected) {
			selected.forEach(function(item) {
				feed.item({
					title: item.title,
					guid: site_url + "view/" + item.id,
					date: item.created_at,
					description: item.text
				});
			});
			res.set('Content-Type', 'text/xml');
			res.send(feed.xml());
		});
	}, null, 20);
};
