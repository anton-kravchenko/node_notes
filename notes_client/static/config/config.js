define([], function(){

	var config = {};

	config.initialize = function(callback){
		var configPath;
		var url = $(location).attr('href');
        
		if(-1 != url.indexOf('localhost')){
			configPath = './js/config/dev_config.json';	
		} else {
			configPath = './js/config/prod_config.json';	
		}

		$.ajax({
		  url: configPath,
		  async: false,
		  dataType: 'json',
		  success: function(data){
				for( i in data){
					config[i] = data[i];
				}
				callback();
			}
		});
	}

	config.get = function(key){
		if(!key) return undefined;

		key = key.split(':');
		if(key && key.length > 0){
			value = this[key[0]];

			if(1 == key.length){
				return value;
			} else {
				try{

					for(var i = 1; i < key.length; i++){
						value = value[key[i]];
					}
					return value;
				} catch (e){
					return undefined;
				}
			}		
		} else {
			return undefined;
		}
	
	}
    
	return config;
});