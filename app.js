var restify = require('restify');
var nconf = require('nconf');
var bunyan = require('bunyan');
var session = require('express-session');

var package_json = require('./package.json');

var init_api = require('./lib/api.js');
var Router = require('./lib/Router');

nconf
	.argv()
	.env('__')
	.file({ file : './defaults.json'});

var log = bunyan.createLogger({
	name : package_json['name'],
	streams : [
	 	{
	        level: 'info',
	        stream: process.stdout 
	    },
	    {
	        level: nconf.get('log:level'),
	        type: 'rotating-file',
	        path: nconf.get('log:path')
	    }
	]
});

init_api(nconf, log, function(error, api){
	var server = restify.createServer({
		name: package_json['name'],
		version: package_json['version']
	});

	server.on('uncaughtException', function (req, res, route, err) {
        var a_log = req.log ? req.log : log;
        a_log.error(err);
        
        res.send(500, {
            status: 'server_error',
            message: err.message
        });
    });

	server.use(restify.bodyParser());
	server.use(restify.queryParser());
	server.use(session({
       	secret: nconf.get('security:session_secret'),
       	name: 'user_session',
       	rolling: true,
       	resave: false,
       	saveUninitialized: false,
       	cookie: {
       		maxAge: 12 * 24 * 60 * 60 * 1000
       }
   	})); 

	var router = new Router(server, {
		target : api,
		log : log
	});

	router.post('/login', {
	   parameters: {
	       username: router.String,
	       password: router.String
	   },
	   call: [ api.login, 'username', 'password' ],
	   session_required: false
	});
	
	router.post('/register', {
	   parameters: {
	       username: router.String,
	       email: router.String,
	       password: router.String
	   },
	   call: [ api.register, 'username', 'email', 'password' ],
	   session_required: false
	});

	server.listen(nconf.get('port'), function () {
		console.log('%s listening at %s', server.name, server.url);
	});
});
