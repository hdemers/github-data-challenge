/*global  gapi:false, _:false*/
define([
  "jquery",
  "viz2",
  "underscore"
],
function ($, viz) {
  console.log("Initializing module bigquery.");
  var exports = {},
    repositoryData = {};

  var request = function (query, data, callback) {
    $.ajax({
      url: "/bigquery/" + query,
      data: data,
      // Returned data is cast as text so as to avoid safety issues with
      // evaluating unknown js code.
      dataType: "text" 
    }).done(function (msg) {
      // Safely parse JSON response.
      callback(JSON.parse(msg));
    });
  };

  // Get a repo timeline: forks by city over time.
  var getRepoStats = function (repoName) {
    var repo = repositoryData[repoName],
      data = {"r": repo.name, "o": repo.owner};
    $("#loader").show();
    viz.erase();
    console.log("Requesting timeline for", repoName);
    request("repo", data, viz.addCities);
  };

  exports.init = function (viewmodel) {
    request("top", null, function (result) {
      _.each(result, function (element) {
        repositoryData[element.name] = element;
      });
      var names = _.pluck(repositoryData, "name");
      viewmodel.repositories(names);
      viewmodel.selectedRepo(names[0]);
    });

    viewmodel.selectedRepo.subscribe(getRepoStats);
  };

  return exports;
});
