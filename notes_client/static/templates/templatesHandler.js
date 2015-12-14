define([
	'jquery',
	'underscore',
	'text!./templates/app_template.html',
], function ($, _, app_template) {

	return {
		app_template : _.template(app_template),
	} 
});
 