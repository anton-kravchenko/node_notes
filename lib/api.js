var init_model = require('./model.js');

var API = function(nconf, model){
	this.nconf = nconf;
	this.model = model;
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