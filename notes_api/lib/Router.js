var _ = require('underscore');

var Router = function(server, options) {
    var self = this;
    
    self.server = server;
    self.options = options;
    
    // type
    self.String = 1;
    self.Integer = 2;
    
    // where
    self.Params = 1;
    self.Body = 2;
    self.RawBody = 3;
}

Router.prototype._sendAndLog = function(req, res, code, result) {
    req.log.info('RESPONSE: ' + code, result);                
    res.status(code).send(result);
}

Router.prototype._process = function(method, options, req, res, next) {
    var self = this;

 	if (self.options.log) {
        var ip = req.headers['x-real-ip'] ? req.headers['x-real-ip'] :
            (req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'] : req.connection.remoteAddress);
        req.log = self.options.log.child({ ip: ip });
    } else {
        req.log = {
            info: function() { },
            debug: function() { },
            error: function() { }
        };
    }

    var parameters_missing = new Array();
    var parameters_invalid = new Array();
    
    var param_values = new Object();
    
    for (var param_name in options.parameters) {
        var param_config = options.parameters[param_name];
        
        if (!_.isObject(param_config)) {
            param_config = { type: param_config };
        }
        
        if (!param_config.where) {
            if('POST' == method || 'DELETE' == method){
                param_config.where = self.Body;
            } else {
                param_config.where = self.Params;
            }
        }

        var param_raw_value;
        if (param_config.where == self.Params) {
            param_raw_value = req.params[param_name];
        } else if (param_config.where == self.Body) {
            param_raw_value = (req.body && req.body[param_name]) ? req.body[param_name] : req.params[param_name] ;
        } else if (param_config.where == self.RawBody) {
            // TODO
        }
        
        // check if parameter exists
        if (!param_raw_value && !param_config.optional) {
            parameters_missing.push(param_name);
        } else if (param_raw_value) {
            // check parameter type
            var valid = false;
            if (param_config.type == self.String) {
                if (_.isString(param_raw_value)) {
                    param_values[param_name] = param_raw_value;
                    valid = true;
                }
            } else if (param_config.type == self.Integer) {
                var int_value = parseInt(param_raw_value);
                if (!_.isNaN(int_value)) {
                    param_values[param_name] = int_value;
                    valid = true;
                }
            }
        
            if (!valid) {
                parameters_invalid.push({
                    name: param_name,
                    type: param_config.type,
                    value: param_raw_value
                });
            }
        }
    }

    req.log.info('REQUEST', param_values);

    if (parameters_missing.length == 0 && parameters_invalid.length == 0) {
        var args = new Array();
        
        for (var i=1; i<options.call.length; ++i) {
            var arg_name = options.call[i];
            if (arg_name.startsWith('session:')) {
                args.push(req.session[arg_name.slice('session:'.length)]);
            } else {
                var arg_value = param_values[arg_name];
                args.push(arg_value ? arg_value : null);
            }
        }
        
        args.push(function(error, result, session) {
            _.extend(req.session, session);
            if (!error) {
                self._sendAndLog(req, res, 200, result);
            } else {
                if (error.notes) {
                    self._sendAndLog(req, res, error.notes.code ? error.notes.code : 422, {
                        status: error.notes.status,
                        message: error.notes.message,
                        details: error.notes.details
                    });
                } else {
                    self._sendAndLog(req, res, 500, {
                        status: 'server_error',
                        message: 'Unknown server error'
                    });
                }
            }
        });
    
        options.call[0].apply(options.target || self.options.target, args);
    } else {
        
        // TODO: parameters error
        if (parameters_missing.length) {
            self._sendAndLog(422, {
                status: 'request_error',
                message: 'Required parameters missing: ' + parameters_missing.join(', '),
                details: parameters_missing
            });
        } else if (parameters_invalid.length) {
            self._sendAndLog(422, {
                status: 'request_error',
                message: 'Invalid parameters format: ' + _.map(parameters_invalid, function(p) { return p.name }).join(', '),
                details: parameters_invalid
            });
        } else {
            self._sendAndLog(422, {
                status: 'request_error',
                message: 'Unknown error with request'
            });
        }
    }
}

Router.prototype._checkOptions = function(options) {
    if (!options.call)
        throw new Error('call field is missing');
    
    // check parameters
    if (!options.call[0])
        throw new Error('missing call function');

    for (var i=1; i<options.call.length; ++i) {
        var arg_name = options.call[i];
        if (!options.parameters[arg_name] && !arg_name.startsWith('session:'))
            throw new Error('parameters field is missing');
    }
}

Router.prototype.get = function(path, options) {
    var self = this;
    self._checkOptions(options);

    self.server.get(path, function(req, res, next) {
        self._process('GET', options, req, res, next);
    });
}

Router.prototype.post = function(path, options) {
    var self = this;
    self._checkOptions(options);
    
    self.server.post(path, function(req, res, next) {
        self._process('POST', options, req, res, next);
    });
}

Router.prototype.delete = function(path, options) {
    var self = this;
    self._checkOptions(options);

    self.server.delete(path, function(req, res, next) {
        self._process('DELETE', options, req, res, next);
    });
}


module.exports = Router;