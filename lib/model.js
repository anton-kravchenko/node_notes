var Sequelize = require('sequelize');
var _ = require('underscore');

module.exports = function(nconf, log, callback){

	var sequelize_log = log.child({
		component : 'sequelize'
	});

    sequelize = new Sequelize(nconf.get('database:uri'), _.extend(nconf.get('database:pass'), {
        logging: function(str)
        {
            sequelize_log.debug(str);
        }
    }));

	var model = {};

	model.User = sequelize.define('User',
	{
		username : Sequelize.STRING,
		password : Sequelize.STRING
	},
	{
		underscored : true
	});

    model.sequelize = sequelize;
    model.Sequelize = Sequelize;
    sequelize.sync().done(function(error)
    {
        callback(error, error ? undefined : model);
    });
};
