var db = require("./db");

exports.index = function(req, res){
  // Article.find(function(err, articles){
  //   if(err) throw new Error(err);
  db.db.views.all('latest', function(selected, count) {
    console.log(selected);
    res.render('home/index', {
      title: 'Latest '+ count +' Links',
      links: selected
    });    
  }, 1000);
  // });
};

exports.about = function(req, res) {
	var my_url = '//' + req.headers.host + '/add/';

	res.render('home/about', {
		title: 'About',
		root_url: my_url
	});
};