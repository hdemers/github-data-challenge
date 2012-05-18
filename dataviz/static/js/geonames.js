/*global  _:false*/
define([
  "jquery",
  "underscore"
],
function ($) {
  console.log("Initializing module geonames.");
  var exports = {},
    url = "http://api.geonames.org/searchJSON?",
    user = "";

  exports.getLngLat = _.memoize(function (locationName, callback) {
    // Build request ajax object
    console.log("getLngLat called.");
    $.ajax({
      url: url,
      data: {
        q: locationName,
        maxRows: 1,
        username: user
      },
      // Returned data is cast as text so as to avoid safety issues with
      // evaluating unknown js code.
      dataType: "text" 
    }).done(function (msg) {
      // Safely parse JSON response.
      var jsonResp = JSON.parse(msg), name, lat, lng;
      // If we have at least one result, use the first element of the returned
      // array (we asked for only one, there shouldn't be more).
      if (jsonResp.totalResultsCount !== 0) {
        name = jsonResp.geonames[0].toponymName;
        lat = jsonResp.geonames[0].lat;
        lng = jsonResp.geonames[0].lng;
        callback(name, lng, lat);
      }
      else {
        // What should we do if there is no result?
        console.warn("No results.");
      }
    });
  });

  return exports;
});
