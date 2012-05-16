/*global d3:false, _:false*/
define([
  "d3"
],
function () {
  var exports = {};

  exports.projection = d3.geo.mercator()
    .scale(800)
    .translate([430, 400]);

  exports.path = d3.geo.path()
    .projection(exports.projection);

  var svg = d3.select("svg");

  var countries = svg.append("g").attr("id", "countries");
  exports.cities = svg.append("g").attr("id", "cities");
  exports.arcs = svg.append("g").attr("id", "arcs");

  d3.json("world-countries.json", function (collection) {
    // Filter out Antartica, it's too big.
    var features = _.filter(collection.features, function (elem) {
      return elem.id !== "ATA";
    });

    countries.selectAll("path")
      .data(features)
      .enter().append("svg:path")
      .attr("d", exports.path);
  });

  return exports;
});
