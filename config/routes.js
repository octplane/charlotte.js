module.exports = function(app){

	//home route
	var home = require('../app/controllers/home'),
		security = require('../app/controllers/security'),
		db = require('../app/controllers/db'),
		link = require('../app/controllers/link');

	app.get('/', home.index);
	app.get('/post_link', security.logged_only, link.post_link);
	app.get('/add', security.logged_only, link.add);
	app.post('/configure', db.configure);
	//app.get('/settings', security.logged_only, settings.index);

	app.get('/login', security.login_view);
	app.post('/login', security.login);
	app.get('/logout', security.logout);


};
