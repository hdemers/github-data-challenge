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
    console.log(cities);
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

  var drawArc = function (source, target) {
    var arc = d3.geo.greatArc()
      .source(source)
      .target(target);
    earth.arcs.selectAll("path")
      .data([arc])
      .enter().append("svg:path")
      .attr("d", earth.path);
    console.log(arc);
  };

  exports.erase = function () {
    drawCity([]);
  }

  var cities = [
    {coord: [-104.99404, 39.75621], forks: 600, city: "Quebec"},
    {coord: [110.99404, 45.75621], forks: 1000, city: "Montreal"}
  ];

  drawArc(cities[0].coord, cities[1].coord);
  return exports;
});
