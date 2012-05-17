"""
RestClient
==========

This is a very simple class encapsulating a connection to a server and
providing the four standard REST methods: get, put, post and delete.

:copyright: (c) 2012 by Hugues Demers

"""

__title__ = 'restclient'
__author__ = 'Hugues Demers'
__copyright__ = 'Copyright 2012 Hugues Demers'

import urllib
import httplib
import base64
import json

# By default, if there is no Accept header in the request, we add one:
# application/json.
DEFAULT_ACCEPT = "application/json"


class RestException(Exception):
    """ Raised when the service returns an HTTP error and raw response is
    False.
    """
    def __init__(self, reason="", status=500, data=""):
            self.reason = reason
            self.status = status
            self.data = data

    def __str__(self):
        return "{reason} ({status}): {data}".format(**self.__dict__)


class RestClient(object):
    def __init__(self, hostname, prefix=None, headers={}, params={},
                 username=None, password=None, secure=False,
                 raw_response=False, logger=None):
        self.hostname = hostname
        self.headers = headers
        self.params = params
        self.secure = secure
        self.username = username
        self.password = password
        self.raw_response = raw_response
        self.prefix = prefix
        self.logger = logger

        if prefix and not prefix.startswith("/"):
            self.prefix = "/" + prefix
        if username:
            base64string = base64.encodestring('%s:%s' % (self.username,
                                                          self.password))[:-1]
            self.headers['Authorization'] = "Basic %s" % base64string

    def get(self, resource, headers={}, **kwargs):
        path = self.make_path(resource, **kwargs)
        return self.request("GET", path, headers=headers)

    def put(self, resource, body=None, headers={}, **kwargs):
        path = self.make_path(resource, **kwargs)
        return self.request("PUT", path, body, headers)

    def post(self, resource, body=None, headers={}, **kwargs):
        path = self.make_path(resource, **kwargs)
        return self.request("POST", path, body, headers)

    def delete(self, resource, headers={}, **kwargs):
        path = self.make_path(resource, **kwargs)
        return self.request("DELETE", path, headers=headers)

    def make_path(self, path, **kwargs):
        if not path.startswith("/"):
            path = "/" + path
        params = dict(self.params)
        params.update(kwargs)
        query = urllib.urlencode(params, True)
        if query != "":
            path = path + "?" + query
        if self.prefix:
            path = self.prefix + path
        return path

    def request(self, method, path, body=None, headers={}):
        self.headers.update(headers)
        # Set the default Accept header if none were specified.
        if 'Accept' not in self.headers:
            self.headers['Accept'] = DEFAULT_ACCEPT

        # Open a connection and make the request.
        if self.secure:
            conn = httplib.HTTPSConnection(self.hostname)
        else:
            conn = httplib.HTTPConnection(self.hostname)
        if self.logger:
            self.logger.debug("Path: {}, Body: {}".format(path, body))
        conn.request(method, path, body=body, headers=self.headers)
        response = conn.getresponse()
        if self.raw_response:
            return response
        if int(response.status) is not 200:
            raise RestException(response.reason, response.status,
                                response.read())

        # Read the response and decode it based on the Content-type header
        # field.
        return self.load(response.getheader('Content-type'),
                         response.read())

    def load(self, content_type, string):
        if not content_type:
            return string
        content_type = content_type.split(';')
        if "application/json" in content_type:
            obj = json.loads(string)
        else:
            obj = string
        return obj
