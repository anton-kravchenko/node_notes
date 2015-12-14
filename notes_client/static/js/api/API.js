define(['jquery', 'config'], function ($, config) {

	
	var API = {

		entry_point  : config.get('entryPoint'),
		frontEndhost : config.get('frontEndHost'), 

		minimumPasswordLength : 5,
		minimumUsernameLength : 5,
		
		login : function(userData, callback, errorCallback){
			var url = this.entry_point  + '/login'
			
			var loginData = {
				username : userData.username,
				password : userData.password
			}

			sendXHR(url, 'post', loginData, callback, errorCallback);
		},	
        
		register : function(userData, callback, errorCallback){
			var url = this.entry_point + '/register';

			var registerData = {
				username : userData.username,
				email : userData.email,
				password : userData.password
			}

			sendXHR(url, 'post', registerData, callback, errorCallback);
		},

		createNote : function(data, callback, errorCallback){
			var url = this.entry_point + '/add_note';
			sendXHR(url, 'post', data, callback, errorCallback);
		},
	
		getNotes : function(callback, errorCallback){
			var url = this.entry_point + '/get_notes';
			sendXHR(url, 'get', null, callback, errorCallback);
		},

		updateNote : function(note_id, data, callback, errorCallback){
			var url = this.entry_point + '/update_note/' + note_id;
			sendXHR(url, 'post', data, callback, errorCallback);
		},

		deleteNote : function(note_id, callback, errorCallback){
			var url = this.entry_point + '/delete_note/' + note_id;
			sendXHR(url, 'delete', null, callback, errorCallback);
		}
	}

	function sendXHR (url, requestType, data, callback, errorCallback){
		var rType = requestType.toUpperCase();

		var xhr = $.ajax({
            type: rType,
            data: data,
            url: url, 
        	xhrFields: {
              	withCredentials: true
            },
			crossDomain: true,
            success: function(response, status, request) { 
        		if(callback){
	         	 	callback(response);
         	 	}
            },
            error: function(response) {
            	console.log('ERROR ' + JSON.parse(response.responseText).message);
            	if(errorCallback){
            		var error = JSON.parse(response.responseText).message;
        			errorCallback(error);
        		}
                if('Unauthorized' == JSON.parse(response.responseText).message){
	    	    	app.navigate('sign_in', {trigger: true});
    		    }
            }
        });
              
	}

	return API;
});