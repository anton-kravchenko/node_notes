var init_api = require('../lib/api.js');
var init_model = require('../lib/model.js');
var nconf = require('nconf');
var bunyan = require('bunyan');

module.exports.model = {

    setUp: function (callback) {
        var self = this;

        nconf.defaults({
            database: {
                uri: "sqlite://:memory:",
                options: {}
            },
            security: {
                password_salt: '123'
            }
        });

        init_api(nconf, bunyan.createLogger({name: 'api'}), function (error, api) {
            self.api = api;

            callback(error, api);
        });
    },

    register_empty_username: function (test) {
        var self = this;

        test.expect(1);

        var email = 'test1@test.com';
        var password = '12345678';

        self.api.register(undefined, email, password, function (error) {
            test.ok(error !== undefined && error.grainbit.code == 403 && error.grainbit.status == 'auth_incorrect_register_data');
            test.done();
        });
    },

    register_short_username: function (test) {
        var self = this;

        test.expect(1);

        var username = 'tes';
        var email = 'test1@test.com';
        var password = '12345678';

        self.api.register(username, email, password, function (error) {
            test.ok(error !== undefined && error.grainbit.code == 403 && error.grainbit.status == 'auth_incorrect_register_data');
            test.done();
        });
    },

    register_invalid_username: function (test) {
        var self = this;

        test.expect(1);

        var username = 'tes 12 3';
        var email = 'test1@test.com';
        var password = '12345678';

        self.api.register(username, email, password, function (error) {
            test.ok(error !== undefined && error.grainbit.code == 403 && error.grainbit.status == 'auth_incorrect_register_data');
            test.done();
        });
    },

    register_empty_email: function (test) {
        var self = this;

        test.expect(1);

        var username = 'test2';
        var password = '12345678';

        self.api.register(username, undefined, password, function (error) {
            test.ok(error !== undefined && error.grainbit.code == 403 && error.grainbit.status == 'auth_incorrect_register_data');
            test.done();
        });
    },

    register_invalid_email: function (test) {
        var self = this;

        test.expect(1);

        var username = 'test2';
        var email = 'notamail';
        var password = '12345678';

        self.api.register(username, email, password, function (error) {
            test.ok(error !== undefined && error.grainbit.code == 403 && error.grainbit.status == 'auth_incorrect_register_data');
            test.done();
        });
    },

    register_empty_password: function (test) {
        var self = this;

        test.expect(1);

        var username = 'test3';
        var email = 'test3@test.com';

        self.api.register(username, email, undefined, function (error) {
            test.ok(error !== undefined && error.grainbit.code == 403 && error.grainbit.status == 'auth_incorrect_register_data');
            test.done();
        });
    },

    register: function (test) {
        var self = this;

        test.expect(2);

        var username = 'test4';
        var email = 'test4@test.com';
        var password = '12345678';

        self.api.register(username, email, password, function (error, status, session_data) {
            test.ok(error === undefined);


            self.api.register(username, email, password, function (error, status, session_data) {
                test.ok(error !== undefined && error.grainbit.code == 403);
                test.done();
            });

        });
    },

    login: function (test) {
        var self = this;

        test.expect(2);

        var username = 'test5';
        var email = 'test5@test.com';
        var password = '12345678';

        self.api.register(username, email, password, function (error, status, session_data) {
            test.ok(error === undefined);

            self.api.login(username, password, function (error, status, session_data) {
                test.ok(error === undefined);
                test.done();
            });
        });
    }
}