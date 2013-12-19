module.exports = function(app){

	//home route
	var home = require('../app/controllers/home'),
		security = require('../app/controllers/security'),
		db = require('../app/controllers/db'),
		link = require('../app/controllers/link');

    app.get('/i/t/:id.jpg', link.thumb);
//	app.use('/i/f/', link.favicon);

	app.get('/', home.index);
	app.get('/about', home.about);
	app.get('/post_link', security.logged_only, link.post_link);
	app.get('/add', security.logged_only, link.add);
	app.post('/add', security.logged_only, link.post);
	app.get('/edit/:id', security.logged_only, link.edit);

	app.post('/configure', db.configure);
	//app.get('/settings', security.logged_only, settings.index);

	app.get('/login', security.login_view);
	app.post('/login', security.login);
	app.get('/logout', security.logout);


};
