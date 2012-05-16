/*global d3:false */
/*global d3:false _:false*/
define([
  "flat",
  "geonames",
  "underscore"
],
function (earth, geonames) {
  var exports = {};
  
  exports.addCities = function (cities) {
    var geocities = {}, geo;
    cities.splice(2);
    _.each(cities, function (city) {
      geonames.getLngLat(city.name, function (canonicalName, lng, lat) {
        console.log(canonicalName);
        city.coord = [lng, lat];
        city.name = canonicalName;
        geo = geocities[canonicalName] || city;
        geo.forks += 1;
        geocities[canonicalName] = geo;
        drawCity(_.values(geocities));
      });
    });
  };


  var drawCity = function (cities) {
    var circle = earth.cities.selectAll("circle")
      .data(cities)
        .attr("cx", function (d) {return earth.projection(d.coord)[0]})
        .attr("cy", function (d) {return earth.projection(d.coord)[1]})
        .attr("r", function (d) {return 5});

    circle.enter()
      .append("svg:circle")
      .attr("cx", function (d) {return earth.projection(d.coord)[0]})
      .attr("cy", function (d) {return earth.projection(d.coord)[1]})
      .attr("r", function (d) {return 5});

    circle.exit().remove();

    circle.on("mouseover", function (d) {
        d3.select("#cityname").text(d.name);
        d3.select("#forks").text(d.forks);
      });
  };

  exports.erase = function () {
    drawCity([]);
  }

  return exports;
});
