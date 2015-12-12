var init_model = require('./model.js');

var API = function(nconf, model){
	this.nconf = nconf;
	this.model = model;
}

API.prototype.login = function(username, password, callback) {
    callback(undefined, { status: 'ok' }, { user_id: 1 });
}

API.prototype.register = function(username, email, password, callback) {
    callback(undefined, { status: 'ok'});
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