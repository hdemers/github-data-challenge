/*global d3:false */
define([
  "d3"
],
function () {
  var exports = {},
    toggle = {},  // animation on/off control
    m0, o0, done;

  function stopAnimation() {
    done = true;
    d3.select('#animate').node().checked = false;
  }

  function startAnimation() {
    done = false;
    d3.timer(function () {
      var origin = exports.projection.origin();
      origin = [origin[0] + 0.18, origin[1] + 0.06];
      exports.projection.origin(origin);
      circle.origin(origin);
      exports.refresh();
      return done;
    });
  }

  function animationState() {
    return 'animation: ' + (done ? 'off' : 'on');
  }


  function mousedown() {
    stopAnimation();
    m0 = [d3.event.pageX, d3.event.pageY];
    o0 = exports.projection.origin();
    d3.event.preventDefault();
  }

  function mousemove() {
    if (m0) {
      var m1 = [d3.event.pageX, d3.event.pageY], 
        o1 = [o0[0] + (m0[0] - m1[0]) / 8, 
        o0[1] + (m1[1] - m0[1]) / 8];
      exports.projection.origin(o1);
      circle.origin(o1);
      exports.refresh();
    }
  }

  function mouseup() {
    if (m0) {
      mousemove();
      m0 = null;
    }
  }

  exports.projection = d3.geo.azimuthal()
    .scale(380)
    .origin([-71.03, 42.37])
    .mode("orthographic")
    .translate([400, 400]);
  
  var svg = d3.select("#body").append("svg:svg")
    .attr("width",  800)
    .attr("height", 800)
    .on("mousedown", mousedown);

  var circle = d3.geo.greatCircle()
      .origin(exports.projection.origin());

  var path = d3.geo.path()
    .projection(exports.projection);

  var countries = svg.append("g").attr("id", "countries");
  exports.arcs = svg.append("g").attr("id", "arcs");
  exports.cities = svg.append("g").attr("id", "cities");

  d3.json("world-countries.json", function (collection) {
    var paths = countries.selectAll("path")
      .data(collection.features)
      .enter().append("svg:path")
      .attr("d", exports.clip);

    paths.append("svg:title")
      .text(function (d) { return d.properties.name; });

    //startAnimation();
    d3.select('#animate').on('click', function () {
      if (done) { 
        startAnimation();
      }
      else {
        stopAnimation();
      }
    });
  });

  d3.select(window)
      .on("mousemove", mousemove)
      .on("mouseup", mouseup);

  exports.refresh = function (duration) {
    var paths = svg.selectAll('path');
    (duration ? paths.transition().duration(duration) :
      paths).attr("d", exports.clip);
  }

  exports.clip = function (d) {
    return path(circle.clip(d));
  }

  return exports;
});
