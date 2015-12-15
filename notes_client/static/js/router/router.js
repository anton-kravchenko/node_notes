define([
	'jquery',
	'backbone',
], function ($, Backbone) {

	var AppRouter = Backbone.Router.extend({
	
		routes: {
			""     	  : "showSignIn",
			"sign_in" : "showSignIn",
			"notes"	  : "showNotes",
		},
		destroyCurrentView: function(){
			if(this.currentView){
				this.currentView.close();
			}
		},

		showSignIn: function () {
			this.destroyCurrentView();

			var self = this;
			require(['landingView'], function(View){
				self.currentView = new View();
				self.currentView.render('index');
			});
			
		},
        
        
		showNotes: function(){
			this.destroyCurrentView();

			var self = this;
			require(['notesView'], function(View){
				self.currentView = new View();
				self.currentView.render();
			});	
			
		}
	});

  	Backbone.View.prototype.close = function () {
    	this.undelegateEvents();
    	this.unbind();
  	};

	app = new AppRouter();
	Backbone.history.start();
});