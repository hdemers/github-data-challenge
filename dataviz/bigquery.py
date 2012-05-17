import logging
import httplib2
import json

import dataviz.geonames as geonames
import webapp2
from google.appengine.api import memcache
from apiclient.discovery import build
from oauth2client.appengine import AppAssertionCredentials
try:
    from oauth2client.client import SignedJwtAssertionCredentials
except ImportError:
    pass


PROJECT_ID = ""
pkey = ""

MOST_FORKED_REPO_QUERY = """
SELECT repository_name, repository_owner, MAX(repository_forks) as maxi
FROM githubarchive:github.timeline
WHERE type = 'ForkEvent' AND
    LENGTH(actor_attributes_location) > 3 AND repository_forks > 200
GROUP BY repository_name, repository_owner
ORDER BY maxi DESC
LIMIT 20
"""

REPO_TIMELINE = """
SELECT created_at, actor_attributes_location, repository_forks
FROM githubarchive:github.timeline
WHERE type = 'ForkEvent' AND
    LENGTH(actor_attributes_location) > 3 AND
    repository_name = '%s'
    AND repository_owner = '%s' AND
    repository_fork = 'false'
ORDER BY repository_forks DESC
"""

# In seconds.
CACHE_EXPIRATION_TIME = 3600 * 24

queries = {
    "top": MOST_FORKED_REPO_QUERY,
    "repo": REPO_TIMELINE,
}


class Bigquery(webapp2.RequestHandler):
    def get(self, resource):
        self.response.headers['Content-Type'] = 'application/json'
        repo_name = self.request.get("r", "")
        repo_owner = self.request.get("o", "")
        key = "-".join([resource, repo_name, repo_owner])
        response = memcache.get(key)
        if response is None:
            logging.warn("Cache miss for GET.")
            if resource == "repo":
                response = get_repo_timeline(repo_name, repo_owner)
                logging.info("Called timeline")
            elif resource == "top":
                response = get_top_repositories()
                logging.info("Called top")
            else:
                response = []
                logging.warn("Bad query %r" % resource)
            memcache.add(key, response, CACHE_EXPIRATION_TIME)
        self.response.out.write(json.dumps(response))


def service():
    credentials = AppAssertionCredentials(
        scope='https://www.googleapis.com/auth/bigquery')
    http = credentials.authorize(httplib2.Http(memcache))
    return build("bigquery", "v2", http=http)


# NOTE: Does not work under GAE. pyOpenSSL is not supported under GAE.
def create_service():
    # Load the key in PKCS 12 format that you downloaded from the Google API
    # Console when you created your Service account.
    f = file('dataviz/%s.p12' % pkey, 'rb')
    key = f.read()
    f.close()

    # Create an httplib2.Http object to handle our HTTP requests and authorize
    # it with the Credentials. Note that the first parameter,
    # service_account_name, is the Email address created for the Service
    # account. It must be the email address associated with the key that was
    # created.
    credentials = SignedJwtAssertionCredentials(
        '%s-ren230ggiuprsnajd5is07hs2dlnohnj@developer.gserviceaccount.com' %
          PROJECT_ID,
        key,
        scope='https://www.googleapis.com/auth/bigquery')
    http = httplib2.Http()
    http = credentials.authorize(http)

    return build("bigquery", "v2", http=http)


def get_top_repositories():
    query = queries['top']
    results = request(query)
    response = []
    for row in results['rows']:
        response.append({
            "name": row['f'][0]['v'],
            "owner": row['f'][1]['v'],
            "forks": row['f'][2]['v'],
        })
    return response


def get_repo_timeline(repo_name, repo_owner):
    query = queries['repo'] % (repo_name, repo_owner)
    results = request(query)
    response = []
    for row in results['rows']:
        city = geonames.locate(row['f'][1]['v'])
        response.append({
            "date": row['f'][0]['v'],
            "name": city.get('name', ""),
            "coord": city.get('coord', []),
            "totalForks": row['f'][2]['v'],
            "forks": 0,
        })
    return response


def request(query):
    results = memcache.get(query)
    if results is None:
        logging.warn("Cache miss for bigquery.")
        results = service().jobs().query(
            body={"query": query},
            projectId=PROJECT_ID
        ).execute()
        memcache.add(query, results, CACHE_EXPIRATION_TIME)
    return results
