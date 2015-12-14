define([
	'jquery',
	'underscore',
	'text!./templates/app_template.html',
	'text!./templates/landingTemplate.html',
	'text!./templates/sign_in_template.html',
	'text!./templates/sign_up_template.html',
], function ($, _, 	app_template,
					landing_template,
					sign_in_template,
					sign_up_template
	) {

	return {
		app_template : _.template(app_template),
		landing_template : _.template(landing_template),
		sign_in_template : _.template(sign_in_template),
		sign_up_template : _.template(sign_up_template),
	} 
});
 