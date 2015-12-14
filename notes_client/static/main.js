var libsPath = './lib/';

require.config({
  shim: {
    underscore: {
      exports: '_'
    },
    backbone: {
      deps: [
        'underscore',
        'jquery'
      ],
      exports: 'Backbone'
    },
  },
  waitSeconds: 200,
  paths: {
    text:           libsPath + 'text',
    jquery:         libsPath + 'jquery',
    underscore:     libsPath + 'underscore',
    backbone:       libsPath + 'backbone',
    
    templatesHandler : './templates/templatesHandler',
    config : './config/config',
    
    appView : './js/views/app',
    landingView : './js/views/landingView',
    notesView : './js/views/notesView',

    API : './js/api/API',
    router: './js/router/router',
  
  }
});

require([
  'backbone',
  'appView',
  'router',
  'config'
], function (Backbone, AppView, Router, config) {
    config.initialize(function(){
      new AppView().render();
    });
});