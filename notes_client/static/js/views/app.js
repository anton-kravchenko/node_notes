define([
	'jquery',
	'underscore',
	'backbone',
	'templatesHandler'
], function ($, _, Backbone, TemplatesHandler) {

	var AppView = Backbone.View.extend({

		el: '#app',

		template: TemplatesHandler.app_template,

		initialize: function () {
			
		},
		render: function () {
			$(this.el).html(this.template());
		}
	});

	return AppView;
});