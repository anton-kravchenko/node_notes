var Sequelize = require('sequelize');
var crypto = require('crypto-js');
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

    function createSalt() {
        var currentdate = new Date();
        var string = currentdate.getFullYear() + currentdate.getMonth() +
            currentdate.getDate() + currentdate.getHours() + currentdate.getMinutes() +
            currentdate.getSeconds() + nconf.get('security:password_salt');
        
        return crypto.createHash('md5').update(string).digest('hex');
    }
    
    function createHash(salt, password) {
        return crypto.createHash('md5').update(salt + password).digest('hex');
    }

	var model = {};

	model.User = sequelize.define('User',
	{
		username : Sequelize.STRING,
		password : Sequelize.STRING,
		salt: Sequelize.STRING
	},
	{
         underscored: true,
         setterMethods: {
         	password: function(value) {
                this.setDataValue('password', value);
                var salt = createSalt();
                this.setDataValue('password', createHash(salt, value));
            }
        },
        instanceMethods: {
            isPasswordEqual: function(value) {
                return this.password == value;
                return this.password == createHash(this.salt, value);
            }
        }
 	});

	model.Post = sequelize.define('post',
	{
		text: Sequelize.STRING,
		date: Sequelize.DATE
	},
	{
		underscored: true
	});
	
	//Objects Relationships
	model.User.hasMany(model.Post, {as: 'posts'});

    model.sequelize = sequelize;
    model.Sequelize = Sequelize;

    sequelize.sync().done(function(error){
        callback(error, error ? undefined : model);
    });
};




