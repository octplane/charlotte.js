// var mongoose = require('mongoose'),
//   Article = mongoose.model('Article');

exports.index = function(req, res){
  // Article.find(function(err, articles){
  //   if(err) throw new Error(err);
    res.render('home/index', {
      title: 'Generator-Express MVC',
      articles: null
    });
  // });
};

exports.about = function(req, res) {
	var my_url = '//' + req.headers.host + '/add/';

	res.render('home/about', {
		title: 'About',
		root_url: my_url
	});
};