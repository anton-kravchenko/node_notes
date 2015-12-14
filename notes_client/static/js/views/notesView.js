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

		template : TemplateHandler.notes_template,

        noteTemplate : TemplateHandler.note_template,

		events: {
            'click .submit_note': 'submitNote',
		},
        
		
		initialize: function () {

		},
        showAddNoteForm: function(){
            $('.notes_container').append(TemplateHandler.new_note_template());
        },
        getAllNotes: function(){
            API.getNotes(function(data){
                var notes = data.notes;
                for(i in notes){
                    $('.notes_container').append(TemplateHandler.note_template({
                        note_text : notes[i].note_text,
                        note_date : notes[i].note_date,

                    }));
                }
            });
        },
        submitNote : function(){
            var note_text = $('.new_note_text').val();

            var date = new Date();
            var note_date = date.getHours()    + ':' +
                            date.getMinutes()  + ':' +
                            date.getMinutes()  + ', ' + 
                            date.getDate()     + '.' +
                            date.getMonth()    + '.' +
                            date.getFullYear();

            var note_data = {
                note_text : note_text,
                note_date : note_date
            }

            API.createNote(note_data, function(response){
                console.log(response);
            }, function(error){ 
                consoel.log(error);
            })
        },
		render: function () {
            $(this.el).html(this.template());
            
            this.showAddNoteForm();
            this.getAllNotes();
		},

	});

	return LandingScreen;

});