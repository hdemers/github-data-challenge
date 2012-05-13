/*global  gapi:false, viewmodel:false, _:false*/
define([
  "jquery",
  "gapi"
],
function ($) {
  console.log("Initializing module bigquery.");
  var exports = {},
    // NOTE: Put your project id here. See the URL of your Google API console.
    projectId = "",
    clientId = projectId + '.apps.googleusercontent.com',
    scopes = 'https://www.googleapis.com/auth/bigquery',
    mostForkedRepoQuery = "SELECT repository_name, " + 
        "MAX(repository_forks) as maxi " +
        "FROM githubarchive:github.timeline " +
        "WHERE type = 'ForkEvent' AND " +
        "LENGTH(actor_attributes_location) > 3 AND " +
        "repository_forks > 200 " +
        "GROUP BY repository_name " +
        "ORDER BY maxi DESC " +
        "LIMIT 20",
    testQuery = 'SELECT repository_name ' + 
        'FROM githubarchive:github.timeline LIMIT 100;';

  if (projectId === "") {
    alert("You did not set your project id.");
    return {};
  }

  exports.request = function (query, callback) {
    console.log("Making request to BigQuery.");
    var request = gapi.client.bigquery.jobs.query({
      'projectId': projectId,
      'query': query,
    });
    request.execute(callback || function (response) {
      console.log("Got: ", response);
    });
  }

  // TODO: Remove the need to timeout. Find a way to call back from the gapi
  // 'module' loading. Read require.js doc.
  setTimeout(function () {
    gapi.auth.authorize({
      client_id: clientId, 
      scope: scopes
    }, function () {
      console.log("Login complete. Token: ", gapi.auth.getToken());
      gapi.client.load('bigquery', 'v2', function () {
        exports.request(mostForkedRepoQuery, function (result) {
          var names = _.map(result.rows, function (row) {
            return row.f[0].v;
          });
          console.log("Most forked repos: ", names);
          viewmodel.repositories(names);
          viewmodel.selectedRepo(names[0]);
        });
      });
    });
  }, 1000);

  return exports;
});

