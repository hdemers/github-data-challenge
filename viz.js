/*global d3:false */
/*global d3:false _:false*/
define([
  "flat",
  "geonames"
],
function (earth, geonames) {
  var exports = {};

  exports.addCities = function (cities) {

    earth.cities.selectAll("circle")
      .data(cities)
      .enter().append("svg:circle")
      .attr("cx", function (d) {return earth.projection(d.coord)[0]})
      .attr("cy", function (d) {return earth.projection(d.coord)[1]})
      .attr("r", function (d) {return d.forks / 100})
      .on("mouseover", function (d) {console.log(d.city)});
  };

  var cities = [
    {coord: [-104.99404, 39.75621], forks: 600, city: "Quebec"},
    {coord: [110.99404, 45.75621], forks: 1000, city: "Montreal"}
  ];

  exports.addCities(cities)
  return exports;
});
