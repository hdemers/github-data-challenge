/*global d3:false */
/*global d3:false _:false*/
define([
  "jquery",
  "flat",
  "underscore"
],
function ($, earth) {
  var exports = {};
  
  exports.addCities = function (cities) {
    var geocities = {}, geo;
    _.each(cities, function (city) {
      if (city.name !== "") {
        geo = geocities[city.name] || city;
        geo.forks += 1;
        geocities[city.name] = geo;
        drawCity(_.values(geocities));
      }
    });
    $("#loader").hide();
  };

  var drawCity = function (cities) {
    var circle = earth.cities.selectAll("circle")
      .data(cities);
        //.attr("cx", function (d) { return earth.projection(d.coord)[0]; })
        //.attr("cy", function (d) { return earth.projection(d.coord)[1]; })
        //.attr("r", function (d) { return 3; });

    circle.enter()
      .append("svg:circle")
      .attr("cx", function (d) {return earth.projection(d.coord)[0]; })
      .attr("cy", function (d) {return earth.projection(d.coord)[1]; })
      .attr("r", function (d) {return 3; });

    circle.exit().remove();

    circle.on("mouseover", function (d) {
        d3.select("#cityname").text(d.name + ":");
        d3.select("#forks").text(pluralize(d.forks, " fork"));
      });
  };

  var pluralize = function (number, string) {
    return number + (number > 1 ? string + "s" : string);
  };

  exports.erase = function () {
    drawCity([]);
  };

  return exports;
});
