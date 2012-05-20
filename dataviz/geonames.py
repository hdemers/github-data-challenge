import logging
from httplib import HTTPException

from google.appengine.api import memcache
from dataviz.restclient import RestClient


URL = "api.geonames.org"
USERNAME = ""

geonames = RestClient(URL, "")


def locate(name):
    city = memcache.get(name)
    if city is None:
        logging.warn("Cache miss for geonames, key %r" % name)
        try:
            response = geonames.get("searchJSON", q=name, username=USERNAME,
                                    maxRows=1)
        except HTTPException, exception:
            logging.warn("Timeout occured %r" % exception)
            return {}
        city = {}
        if "totalResultsCount" in response and response['totalResultsCount']:
            city = {
                'name': response['geonames'][0]['toponymName'],
                'coord': [
                    response['geonames'][0]['lng'],
                    response['geonames'][0]['lat']
                ],
            }
        result = memcache.add(name, city)
    return city
