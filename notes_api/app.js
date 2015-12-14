var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var bunyan = require('bunyan');
var nconf = require('nconf');
var cors = require('express-cors')

var package_json = require('./package.json');

var init_api = require('./lib/api.js');
var Router = require('./lib/Router');

nconf
    .argv()
    .env('__')
    .file({file: './defaults.json'});

var log = bunyan.createLogger({
    name: package_json['name'],
    streams: [
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

init_api(nconf, log, function (error, api) {
    var app = express();

    app.on('uncaughtException', function (req, res, route, err) {
        var a_log = req.log ? req.log : log;
        a_log.error(err);

        res.send(500, {
            status: 'server_error',
            message: err.message
        });
    });

    app.use(bodyParser.urlencoded({ extended: true }));

    app.use(session({
        secret: nconf.get('security:session_secret'),
        name: 'user_session',
        rolling: true,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 12 * 24 * 60 * 60 * 1000
        }
    }));

    app.use(cors({
        allowedOrigins: [
            nconf.get('frontend:host'), 'http://localhost:3110'
        ]
    }));

    app.use(function (req, res, next) {

        // Website you wish to allow to connect
        res.setHeader('Access-Control-Allow-Origin', nconf.get('frontend:host'));

        // Request methods you wish to allow
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

        // Request headers you wish to allow
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        res.setHeader('Access-Control-Allow-Credentials', true);

        // Pass to next layer of middleware
        next();
    })
    
    var router = new Router(app, {
        target: api,
        log: log
    });

    router.post('/login', {
        parameters: {
            username: router.String,
            password: router.String
        },
        call: [api.login, 'username', 'password']
    });

    router.post('/register', {
        parameters: {
            username: router.String,
            email: router.String,
            password: router.String
        },
        call: [api.register, 'username', 'email', 'password']
    });

    router.post('/add_note', {
        parameters: {
            note_text: router.String,
            note_date: router.String
        },
        call: [ api.createNote, 'session:user_id', 'note_text', 'note_date' ]
    });

    router.get('/get_notes', {
        parameters: {
        },
        call: [ api.getAllNotes, 'session:user_id']
    });

    router.post('/update_note', {
        parameters: {
            note_id : router.Integer,
            note_text: router.String,
            note_date: router.String
        },
        call: [ api.updateNote, 'session:user_id', 'note_id', 'note_text', 'note_date']
    });

    router.delete('/delete_note', {
        parameters: {
            note_id : router.Integer,
        },
        call: [ api.deleteNote, 'session:user_id', 'note_id']
    });

    app.listen(nconf.get('port'), function () {
        console.log('Listening at %s', nconf.get('port'));
    });
});
