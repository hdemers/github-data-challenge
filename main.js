/*global  viewmodel:true*/
require({
  paths: {
    "jquery": "http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min",
    "underscore": "http://documentcloud.github.com/underscore/underscore-min",
    "d3": "http://mbostock.github.com/d3/d3",
    "knockout": "http://cloud.github.com/downloads/SteveSanderson/knockout/knockout-2.1.0",
    "gapi": "https://apis.google.com/js/client"
  }
})

require(['globe', 'viz', 'geonames', 'bigquery', 'knockout', "underscore"],
function (globe, viz, geonames, bigquery, ko) {

  viewmodel = {
    repositories: ko.observableArray(),
    selectedRepo: ko.observable()
  };

  ko.applyBindings(viewmodel);
  //domReady(function () {
    //console.log("DOM ready.")
    //app.initialize()
  //})
})



