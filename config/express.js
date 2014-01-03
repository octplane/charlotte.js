var express = require('express'),
  FileSessionStore = require('connect-session-file'),
  config = require('./config'),
  db = require('../app/controllers/db'),
  link = require('../app/controllers/link');

module.exports = function(app, config) {
  app.configure(function () {
    app.set('port', config.port);
    app.set('views', config.root + '/app/views');
    app.set('view engine', 'ejs');

    app.use(express.compress());
    app.use(express.favicon(config.root + '/public/img/favicon.ico'));
    app.use(express.static(config.root + '/public'));
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('mycookiesecret'));
    app.use(express.session({
      secret:'changethissecret',
      store: new FileSessionStore({path:config.db_path, printDebug:false, useAsync:true})
    }));
    app.use('/i/t', express.static(config.db_path + 'thumb'));
    app.use('/i/f', express.static(config.db_path + 'favicon'));


    // Session-persisted message middleware
    app.use(function(req, res, next){
      var err = req.session.error
        , msg = req.session.success;
      delete req.session.error;
      delete req.session.success;
      res.locals.message = '';
      if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
      if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
      if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
      next();
    });

    // Inject current user
    app.use(function(req, res, next){
      if(req.session.user) {
        res.locals.me = req.session.user;
      } else {
        res.locals.me = undefined;
      }

      res.locals.has_search = false;
      res.locals.in_add_sequence = false;
      next();
    });

    // development only
    if ('development' == app.get('env')) {
      app.use(express.errorHandler());
    }

    // Site wide configuration
    app.use(db.connect);
    
    // Main routing table
    app.use(app.router);

    // And the 404 finally
    // app.use(function(req, res) {
    //   res.status(404).render('misc/404', { title: '404' });
    // });

  });
};
