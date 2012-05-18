/*global  gapi:false, _:false*/
define([
  "jquery",
  "viz",
  "underscore"
],
function ($, viz) {
  console.log("Initializing module bigquery.");
  var exports = {},
    // NOTE: Put your project id here. See the URL of your Google API console.
    projectId = "",
    clientId = projectId + '.apps.googleusercontent.com',
    scopes = 'https://www.googleapis.com/auth/bigquery',
  mostForkedRepoQuery = "SELECT repository_name, repository_owner, " +
        "MAX(repository_forks) as maxi " +
        "FROM githubarchive:github.timeline " +
        "WHERE type = 'ForkEvent' AND " +
        "LENGTH(actor_attributes_location) > 3 AND " +
        "repository_forks > 200 " +
      "GROUP BY repository_name, repository_owner " +
        "ORDER BY maxi DESC " +
        "LIMIT 20",
    repoQuery = "SELECT created_at, actor_attributes_location, " + 
      "repository_forks FROM githubarchive:github.timeline " +
      "WHERE type = 'ForkEvent' AND " +
      "LENGTH(actor_attributes_location) > 3 AND " +
      "repository_name = 'REPO' " +
      "AND repository_owner = 'OWNER' AND " +
      "repository_fork = 'false' ORDER BY repository_forks DESC",
    testQuery = 'SELECT repository_name ' + 
      'FROM githubarchive:github.timeline LIMIT 100;',
    repositoryData = {};

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

  var getMostForkedRepos = function (viewmodel) {
    exports.request(mostForkedRepoQuery, function (result) {
      var names = _.map(result.rows, function (row) {
        repositoryData[row.f[0].v] = {
          name: row.f[0].v,
          owner: row.f[1].v,
          forks: row.f[2].v
        };
        return row.f[0].v;
      });
      viewmodel.repositories(names);
      viewmodel.selectedRepo(names[0]);
    });
  }

  // Query for a given repository. See the 'repoQuery' string above.
  var getRepoStats = function (repoName) {
    var repo = repositoryData[repoName],
      query = repoQuery
        .replace("REPO", repo.name)
        .replace("OWNER", repo.owner);
    // Make a request to Big Query for the given repository.
    exports.request(query, function (result) {
      var cities = _.map(result.rows, function (row) {
        return {
          'date': row.f[0].v,
          'name': row.f[1].v,
          'totalForks': row.f[2].v,
          'forks': 0
        }
      });
      viz.addCities(cities);
    });
  };

  // This goes into an init function so we can pass viewmodel as an argument,
  // see main.js.
  exports.init = function (viewmodel) {
    // The default callback function when no `?onload=` argument is provided to
    // client.js is `gapi_onload`. Let's use that fact when requiring `gapi`,
    // see below.
    window.gapi_onload = function () {
      console.log("Google's client library loaded. Now authorizing.");
        // Oh Google! Why do you have to make our lives so complicated? Why are
        // your librairies so convoluted? Why not keep it simple?
      setTimeout(function () {
        gapi.auth.authorize({
          client_id: clientId, 
          scope: scopes
        }, function () {
          console.log("Login complete. Token: ", gapi.auth.getToken());
          gapi.client.load('bigquery', 'v2', function () {
            console.log("Google's bigquery library loaded.")
            getMostForkedRepos(viewmodel);
            // Subscribe to the viewmodel's selectedRepo observable, i.e. the
            // drop-down selector.
            viewmodel.selectedRepo.subscribe(getRepoStats);

          });
        })
      }, 1000);
    };
    require(["gapi"]);
    console.log("gapi required");
  };

  return exports;
});

