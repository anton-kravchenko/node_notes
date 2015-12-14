define([
	'jquery',
	'underscore',
	'text!./templates/app_template.html',
	'text!./templates/landingTemplate.html',
	'text!./templates/sign_in_template.html',
	'text!./templates/sign_up_template.html',
	'text!./templates/notes_template.html',
	'text!./templates/note_template.html',
	'text!./templates/new_note_template.html'


], function ($, _, 	app_template,
					landing_template,
					sign_in_template,
					sign_up_template,
					notes_template,
					note_template,
					new_note_template
	) {

	return {
		app_template : _.template(app_template),
		landing_template : _.template(landing_template),
		sign_in_template : _.template(sign_in_template),
		sign_up_template : _.template(sign_up_template),
		notes_template : _.template(notes_template),
		note_template : _.template(note_template),
		new_note_template : _.template(new_note_template)
	} 
});
 