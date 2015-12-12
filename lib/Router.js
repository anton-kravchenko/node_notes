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

Router.prototype._process = function(method, options, req, res, next) {
    var self = this;
    
    var parameters_missing = new Array();
    var parameters_invalid = new Array();
    
    var param_values = new Object();
    
    for (var param_name in options.parameters) {
        var param_config = options.parameters[param_name];
        
        if (!_.isObject(param_config)) {
            param_config = { type: param_config };
        }
        
        if (!param_config.where) {
            param_config.where = (method == 'POST') ? self.Body : self.Params;
        }

        var param_raw_value;
        if (param_config.where == self.Params) {
            param_raw_value = req.params[param_name];
        } else if (param_config.where == self.Body) {
            param_raw_value = req.params[param_name];
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
    
    if (parameters_missing.length == 0 && parameters_invalid.length == 0) {
        var args = new Array();
        
        for (var i=1; i<options.call.length; ++i) {
            var arg_name = options.call[i];
            var arg_value = param_values[arg_name];
            args.push(arg_value ? arg_value : null);
        }
        
        args.push(function(error, result) {
            if (!error) {
                res.send(result);
            } else {
                // TODO
                res.send({ status: 'server_error' });            
            }
        })
    
        options.call[0].apply(options.target || self.options.target, args);
    } else {
        
        // TODO: parameters error
        if (parameters_missing.length) {
            res.send(422, {
                status: 'request_error',
                message: 'Required parameters missing: ' + parameters_missing.join(', '),
                details: parameters_missing
            });
        } else if (parameters_invalid.length) {
            res.send(422, {
                status: 'request_error',
                message: 'Invalid parameters format: ' + _.map(parameters_invalid, function(p) { return p.name }).join(', '),
                details: parameters_invalid
            });
        } else {
            res.send(422, {
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
    for (var i=1; i<options.call.length; ++i) {
        var arg_name = options.call[i];
        if (!options.parameters)
            throw new Error('parameters field is missing');
        if (!options.parameters[arg_name])
            throw new Error('parameter definition no found for ' + arg_name);
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

module.exports = Router;