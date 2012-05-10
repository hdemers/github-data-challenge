/*global d3:false */
/*global d3:false _:false*/
define([
  "globe"
],
function (globe) {
  var exports = {},
    positions = [];

  //var data = [
    //{lat: 31.95376472, lng: -89.23450472},
    //{lat: 30.68586111, lng: -95.01792778},
    //{lat: 38.94574889, lng: -104.5698933},
    //{lat: 42.74134667, lng: -78.05208056},
  //];

  //_.each(data, function (datum) {
    //positions.push(globe.projection([datum.lng, datum.lat]));
  //});
 
  var geoFeatures = [{
    "type": "Feature",
    "geometry": {
      "type": "LineString",
      "coordinates": [
        [-104.98726, 39.74136],
        [-105.98720, 40.74132],
        [-106.98715, 42.74127],
        [-106.98713, 43.74117],
        [-107.98712, 45.74106]
      ]
    },
    "properties": {
      "name": "16th Street Free Bus",
      "style": {
        "color": "#004070",
        "weight": 4,
        "opacity": 0.9
      },
      "popupContent": "This is the 16th street free bus ..."
    }
  },
  {
    "type": "Feature",
    "properties": {
      "name": "Coors Field",
      "amenity": "Baseball Stadium",
      "popupContent": "This is where the Rockies play!",
      "radius": 400
    },
    "geometry": {
      "type": "Point",
      "coordinates": [-104.99404, 39.75621]
    }
  }
  ];

  setTimeout(function () {
    globe.feature
      .data(geoFeatures)
      .enter().append("svg:path")
      .attr("d", globe.clip);

    globe.refresh();
  }, 1000);

  return exports;
});
