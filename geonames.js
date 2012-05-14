/*global  */
define([
  "jquery"
],
function ($) {
  var exports = {},
  	url = "http://api.geonames.org/searchJSON?";
  console.log("Initializing module geonames.");

  exports.getLngLat = function (user, locationName, callback) {
  	//Build request ajax object
	console.log("flag");
	
  	$.ajax({
  		  url: url,
  		  data: {
  			q: locationName,
  			maxRows: 1,
  			username: user
  		  },
  		  dataType: "text" //Return data is cast as text so as to avoid safety issues with evaluating unknown js code.
  		})
  		.done(function(msg){
	  		//Safely parse JSON response.
	  		var jsonResp = JSON.parse(msg);
	  		console.log(jsonResp);
	  		//Navigate the response.
	  		$.each(jsonResp, function(key, val) {
	  			if(key == "geonames"){
	  				var name = val[0]["toponymName"];
	  				var lat = val[0]["lat"];
	  				var long = val[0]["lng"];
	  				
	  				console.log(name+"\t"+lat+"\t"+long);
	  				callback(name, long, lat);
	  			};
	  		});
  		});
  };
  
  return exports;
});
