define([
	'jquery', 
	'underscore',
	'backbone',
    'templatesHandler',
    'API'
], function ($, _, Backbone, TemplateHandler, API) {

    var LandingScreen = Backbone.View.extend({

		el: '#app',

		signInUpcontainer : '.signInUpContainer',

		template : TemplateHandler.notes_template,

        noteTemplate : TemplateHandler.note_template,

		events: {
            'click .submit_new_note': 'submitNote',
            'click .cancel_new_note': 'cancelNewNote'
		},
        
		maxNoteLength :  255,

		initialize: function () {

		},
        showAddNoteForm: function(){
            var self = this;
            $('.notes_container').append(TemplateHandler.new_note_template());
            $('.new_note_text').on('input', function(){
                self.handleInputIndicator($(this));
                // self.handleInputIndicator.call(self, $(this));
            });
        },
        handleInputIndicator: function(input_el){
            var messageLenght = $(input_el).val().length;
            var indicatorWidth =  messageLenght / this.maxNoteLength * 100

            $(input_el).parent().find('.message_length').text(messageLenght);

            $(input_el).parent().find('.message_length_indicator').animate({
                width : indicatorWidth + '%'
                }, {
                duration: 50,
            });
        },
        fillNotes: function(notes){
            var self = this;
            for(i in notes){
                $('.notes_container').append(TemplateHandler.note_template({
                    note_text : notes[i].note_text,
                    note_date : notes[i].note_date,
                }));

                $('.note_text').last().on('focusin', function(){
                    $(this).parent().find('.update_note_controls').fadeIn();
                });
                $('.note_text').last().on('focusout', function(){
                    $(this).parent().find('.update_note_controls').fadeOut();
                });
                $('.note_text').last().find('.cancel_note').on('click', function(){
                    $(this).parent().fadeOut();
                });

                (function(note_id, note_text_el){
                    $('.note_text').last().parent().find('.update_note').on('click', function(){
                        var note_data = {
                            note_text : $(note_text_el).val(),
                            note_date : self.getCurrentDate()
                        }

                        $(note_text_el).parent().find('.updating_spinner').css('display', 'inline-flex');

                        API.updateNote(note_id, note_data, function(response){
                                $(note_text_el).parent().find('.updating_spinner').css('display', 'none');
                            },
                            function(error){
                                $(note_text_el).parent().find('.updating_spinner').css('display', 'none');
                            }
                        );
                    });
                    $('.note_text').last().parent().find('.delete_note').on('click', function(){
                        $(note_text_el).parent().find('.updating_spinner').css('display', 'inline-flex');

                         API.deleteNote(note_id, function(response){
                                $(note_text_el).parent().fadeOut(function(){
                                    $(this).remove();
                                })
                            },
                            function(error){
                                $(note_text_el).parent().find('.updating_spinner').css('display', 'none');
                            }
                        );
                    });

                })(parseInt(notes[i].id),  $('.note_text').last());

            }
        },
        getAllNotes: function(){
            var self = this;
            API.getNotes(function(data){
                var notes = data.notes;
                self.fillNotes(notes);
            });
        },
        getCurrentDate: function(){
            var date = new Date();
            return  date.getHours()    + ':' +
                    date.getMinutes()  + ':' +
                    date.getMinutes()  + ', ' + 
                    date.getDate()     + '.' +
                    date.getMonth()    + '.' +
                    date.getFullYear();
        },
        cancelNewNote: function(){
            $('.new_note_text').val('');
            this.handleInputIndicator($('.new_note_text'));
        },
        submitNote : function(){
            var self = this;
            var note_text = $('.new_note_text').val();

            var note_data = {
                note_text : note_text,
                note_date : this.getCurrentDate()
            }

            API.createNote(note_data, function(response){
                 self.fillNotes(new Array(response));
                 $('.new_note_text').val('');
                 self.handleInputIndicator($('.new_note_text'));
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