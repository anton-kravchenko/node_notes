define([
	'jquery', 
	'underscore',
	'backbone',
    'templatesHandler',
    'API',
], function ($, _, Backbone, TemplateHandler, API) {

    var LandingScreen = Backbone.View.extend({

		el: '#app',

		signInUpcontainer : '.signInUpContainer',

		template : TemplateHandler.landing_template,

		signInTemplate : TemplateHandler.sign_in_template,

		signUpTemplate : TemplateHandler.sign_up_template,

		events: {
            'click .grainbit_logo': 'showIndex',
			'click .login_button': 'checkPassword',
			'click .signInButton': 'showSignInForm',
			'click .signUpButton': 'showSignUpForm',
			'click .create_account_button' : 'createAnAccount',
			'click #landing_register' : 'register',
			'click #logIN' : 'login',
            /* Common */
            'keyup #username': 'onKeyUp',
            'keyup #email': 'onKeyUp',
            'keyup #password': 'onKeyUp',
            'keyup #password_confirm': 'onKeyUp',
		},
        
		login : function(){
            var username = $('#username').val() || '';
			var password = $('#password').val() || '';
            var error_message = '';
            
            if (!username.length) {
                if (error_message.length)
                    error_message = error_message + ', ';
                
                error_message = error_message + '<strong>username</strong> is empty';
                $('#username').addClass('invalid');
            }
            
            if (!password.length) {
                if (error_message.length)
                    error_message = error_message + ', ';
                
                error_message = error_message + '<strong>password</strong> is empty';
                $('#password').addClass('invalid');
            }
            
            if (error_message.length) {
                console.log('error', 'Wrong login data: ' + error_message);
                return;
            }
            
			API.login({username : $('#username').val() || '', password : $('#password').val() || ''}, function(result){
				if(result.hasOwnProperty('id')){
					app.navigate('notes', true);
				}
			}, function(result) {
			    var error = JSON.parse(result.responseText);
                
                if (result.status == 403 && error.status == 'auth_incorrect_password') {
                    
                    $('#username').addClass('invalid');
                    $('#password').addClass('invalid');
                    
                    console.log('error', error.message);
                } else if (result.status == 422 && error.details.length){
                    
                    if (error.details.indexOf('username') > -1) {
                        $('#username').addClass('invalid');
                    }
                    if (error.details.indexOf('password') > -1) {
                        $('#password').addClass('invalid');
                    }
                    
                    console.log('error', error.message);
                } else {                
                    
                    console.log('error', 'API Server error');
                }
			});
		},

		register : function() {
			var username = $('#username').val() || '';
			var email = $('#email').val() || '';
			var password = $('#password').val() || '';
			var confirmPassword = $('#password_confirm').val() || '';
            var userData = {    username : username,
           				        email : email,
                                password : password };
            
            var error_message = '';
            
            if (!username.length) {
                if (error_message.length)
                    error_message = error_message + ', ';
                
                error_message = error_message + '<strong>username</strong> is empty';
                $('#username').addClass('invalid');
            }
            
            if (!email.length) {
                if (error_message.length)
                    error_message = error_message + ', ';
                
                error_message = error_message + '<strong>email</strong> is empty';
                $('#email').addClass('invalid');
            }
            
            if (!password.length) {
                if (error_message.length)
                    error_message = error_message + ', ';
                
                error_message = error_message + '<strong>password</strong> is empty';
                $('#password').addClass('invalid');
            }
            
            if (!confirmPassword.length) {
                if (error_message.length)
                    error_message = error_message + ', ';
                
                error_message = error_message + '<strong>confirm password</strong> is empty';
                $('#password_confirm').addClass('invalid');
            }
            
            if (password.length && confirmPassword.length && password != confirmPassword) {
                if (error_message.length)
                    error_message = error_message + ', ';
                
                error_message = error_message + 'confirm password doesn\'t match password';
                $('#password').addClass('invalid');
                $('#password_confirm').addClass('invalid');
            }
            
            if (error_message.length) {
                console.log('error', 'Wrong register data: ' + error_message);
                return;
            }
            
			if (false != userData) {
                //console.log('Trying to register user with data: ', userData);
				API.register(userData, function(result){
					if(result.hasOwnProperty('id')){
						app.navigate('notes', true);
					}
				}, function(result) {
				    var error = JSON.parse(result.responseText);
                    //console.log('Register error: ', error);
                    
                    if ((result.status == 422 || result.status == 403) && error.details.length) {
                        //console.log(error.details);
                        
                        if (error.details.indexOf('username') > -1) {
                            $('#username').addClass('invalid');
                        }
                        if (error.details.indexOf('email') > -1) {
                            $('#email').addClass('invalid');
                        }
                        if (error.details.indexOf('password') > -1) {
                            $('#password').addClass('invalid');
                        }
                        
                        console.log('error', error.message);
                    } else {
                        //console.log(error);
                        console.log('error', 'API Server error');
                    }
				})
			}
		},
        onKeyUp: function(e) {
            //console.log('onKeyup: ', e);
            $(e.currentTarget).removeClass('invalid');
            
            if(e.keyCode == 13) {
                if (this.pageID == 'signUp') {
                    this.register();
                } else if (this.pageID == 'signIn') {
                    this.login();
                }
            };
        },
		createAnAccount : function(){
			require(['projectSpace'], function(View){
				new View().render();
			})
		},
        showSignUpForm: function(){
            this.pageID = 'signUp';
			$('.signInButton').addClass('signup_button_unactive');
			$('.signUpButton').removeClass('signup_button_unactive')

			$('.signInUpContainer').html(this.signUpTemplate());
		},
		showSignInForm: function(){
            this.pageID = 'signIn';
			$('.signUpButton').addClass('signup_button_unactive');
			$('.signInButton').removeClass('signup_button_unactive')

			$('.signInUpContainer').html(this.signInTemplate());
		},
		initialize: function () {
		},
		render: function (page) {
            this.pageID = page;
            
            $(this.el).html(this.template());
            
			if (page == 'signIn'){
				this.showSignInForm();
            } else {
				this.showSignUpForm();				
			}
		},

	});

	return LandingScreen;

});