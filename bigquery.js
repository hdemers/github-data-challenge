/*global  gapi:false*/
define([
  "jquery",
  "gapi"
],
function ($) {
  console.log("Initializing module bigquery.");
  var exports = {},
    projectId = "22498051859",
    clientId = projectId + '.apps.googleusercontent.com',
    apiKey = 'AIzaSyAHqTYilT1TJhwyWcXnyZzwxSdQAkr07g0',
    scopes = 'https://www.googleapis.com/auth/bigquery',
    defDataSet = {'projectId': projectId},
    queryData = {
      'projectId': projectId,
      'query': 'SELECT repository_name ' + 
        'FROM [publicdata:samples.github_timeline] LIMIT 100;',
    };

  function requestBigQuery() {
    console.log("Making request to BigQuery.");
    //var request = gapi.client.bigquery.projects.list();
    var request = gapi.client.bigquery.jobs.query(queryData);
    request.execute(function (response) {
      console.log("Got ", response);
    });
  }

  // TODO: Remove the need to timeout. Find a way to call back from the gapi
  // 'module' loading. Read require.js doc.
  setTimeout(function () {
    // The API key auth mecanism does not work, even though the doc says so.
    // Must use OAuth2, which is a pain.
    //gapi.client.setApiKey(apiKey); 
    
    gapi.auth.authorize({
      client_id: clientId, 
      scope: scopes
    }, function () {
      console.log("Login complete. Token: ", gapi.auth.getToken());
      gapi.client.load('bigquery', 'v2', requestBigQuery);
    });

    console.log("BigQuery API key set.");
  }, 1000);

  return exports;
});

