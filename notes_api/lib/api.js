var init_model = require('./model.js');
var validator = require('validator');
var errors = require('../lib/errors.js');
var _ = require('underscore');

var API = function(nconf, model){
	this.nconf = nconf;
	this.model = model;
}

function _requireAuthorization (user_id, toplevel_callback, callback) {
    if (!user_id) {
        var error_unauthorized = errors.create('auth_unauthorized', 'Unauthorized', {
            code: 401
        });
        toplevel_callback(error_unauthorized);
    } else {
        callback();
    }
}

API.prototype.login = function(username, password, callback) {
	var self = this;
    
    self.model.User.findOne({ where: {username: username} }).then(function(user) {
       	if (user && user.isPasswordEqual(password)) {
       		callback(undefined, { id: user.get('id').toString() }, { user_id: user.get('id') });
       	} else {
           var error = errors.create('auth_incorrect_password', 'Incorrect login/password', {
               code: 403
           });
           console.log(error);
           callback(error);
       }  
   });
}

API.prototype.register = function(username, email, password, callback) {
    var self = this;
    var errors_message = '';
    var invalid_fields_list = [];

    var pushInvalidField = function (list, field) {
        if (!_.contains(list, field)) {
            list.push(field);
        }
    };

    var updateErrorMessage = function (errors_message, new_error_message) {
        var message = '';

        if (errors_message.length > 0) {
            message = errors_message + ' ' + new_error_message + '.';
        } else {
            message = errors_message + new_error_message + '.';
        }

        return message
    };

    //Validating Username
    if (!validator.isLength(username, 1)) {
        pushInvalidField(invalid_fields_list, 'username');
        errors_message = updateErrorMessage(errors_message, 'Empty username');
    } else if (!validator.isLength(username, 4)) {
        pushInvalidField(invalid_fields_list, 'username');
        errors_message = updateErrorMessage(errors_message, 'Username is too short');
    }
    ;

    if (validator.isLength(username, 1) && !validator.isAlphanumeric(username)) {
        pushInvalidField(invalid_fields_list, 'username');
        errors_message = updateErrorMessage(errors_message, 'Invalid username');
    }

    //Validating Email
    if (!validator.isLength(email, 1)) {
        pushInvalidField(invalid_fields_list, 'email');
        errors_message = updateErrorMessage(errors_message, 'Empty email');
    }

    if (validator.isLength(email, 1) && !validator.isEmail(email)) {
        pushInvalidField(invalid_fields_list, 'email');
        errors_message = updateErrorMessage(errors_message, 'Invalid email');
    }

    //Validating Password
    if (!validator.isLength(password, 1)) {
        pushInvalidField(invalid_fields_list, 'password');
        errors_message = updateErrorMessage(errors_message, 'Empty password');
    } else if (!validator.isLength(password, 8)) {
        pushInvalidField(invalid_fields_list, 'password');
        errors_message = updateErrorMessage(errors_message, 'Password is too short');
    }

    if (validator.isLength(password, 1) && !validator.isAlphanumeric(password)) {
        pushInvalidField(invalid_fields_list, 'password');
        errors_message = updateErrorMessage(errors_message, 'Invalid password');
    }

    //Check if have validation errors
    if (invalid_fields_list.length > 0) {
        var error = errors.create('auth_incorrect_register_data', errors_message, {
            code: 403,
            details: invalid_fields_list
        });
        console.log(error);
        callback(error);
        return;
    }

    self.model.User.findOne({where: {username: username}}).then(function (user) {

        console.log('Trying to register user');

        if (user) {
            console.log('Found user.');
            var error = errors.create('auth_incorrect_register_data', 'Username already exists', {
                code: 403
            });
            callback(error);
        }
        else {
            console.log('Creating new user:');

            var new_user = self.model.User;

            new_user
                .build({
                    username: username,
                    email: email,
                    password: password
                })
                .save()
                .then(function (registered_user) {
                    callback(undefined, {id: registered_user.get('id').toString()}, {user_id: registered_user.get('id')})
                })
                .catch(function (error) {
                    var error = errors.create('auth_incorrect_register_data', 'User create error', {
                        code: 403
                    });

                    callback(error);
                })
        }
    });
}

API.prototype.createNote = function(user_id, note_text, note_date, callback) {
    var self = this;

    _requireAuthorization(user_id, callback, function(){
        var new_note = self.model.Note;
        new_note.build({
            user_id : user_id,
            note_text: note_text,
            note_date : note_date
        })
        .save()
        .then(function(new_note){
            callback(undefined, new_note);
        })
        .catch(function(error){
            callback(error);
        });
    });

}

API.prototype.getAllNotes = function(user_id, callback) {
    var self = this;

    _requireAuthorization(user_id, callback, function(){
        self.model.Note.findAll({ where: { user_id: user_id }})
            .then(function(notes){
                if (notes) {
                    var list = [];
                    for (var i = 0; i < notes.length; i++) {
                        var note = notes[i];
                        list.push(note.toObject());
                    }
                    callback(undefined, {notes: list});
                }
            })
            .catch(function(error){
                callback(error);
            });
    });

}

API.prototype.updateNote = function(user_id, note_id, note_text, note_date, callback) {
    var self = this;

    _requireAuthorization(user_id, callback, function(){
        self.model.Note.findOne({ where: { id : note_id }})
            .then(function(note){
                if(note){
                    note.set('note_text', note_text);
                    note.save()
                    .then(function(note) {
                        callback(undefined, {note: note.toObject()});
                    })
                    .catch(function(error){
                        callback(error);
                    });
                } else {
                    var error = errors.create('request_error', 'Note not found', {
                        code: 404
                    });
                    callback(error);
                }
            })
            .catch(function(error){
                callback(error);
            });
    });

}

API.prototype.deleteNote = function(user_id, note_id, callback) {
    var self = this;

    _requireAuthorization(user_id, callback, function(){
        self.model.Note.findOne({ where: { id : note_id }})
            .then(function(note){
                if(note){
                    note.destroy({force : true})
                        .then(function() {
                            callback(undefined, {status: 'ok'});
                        })
                        .catch(function(error){
                            callback(error);
                        });
                } else {
                    var error = errors.create('request_error', 'Note not found', {
                        code: 404
                    });
                    callback(error);
                }
            })
            .catch(function(error){
                callback(error);
            });
    });

}

module.exports = function(nconf, log, callback){
	init_model(nconf, log, function(error, model){
		if(!error){
			var api = new API(nconf, model);
			callback(undefined, api);
		} else {
			callback(error);			
		}
	})
}