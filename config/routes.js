module.exports = function(app){

	//home route
	var home = require('../app/controllers/home'),
		security = require('../app/controllers/security'),
		db = require('../app/controllers/db');

	app.get('/', db.ready, security.logged_only, home.index);

	app.get('/login', security.login_view);
	app.post('/login', security.login);
	app.get('/logout', security.logout);


};
