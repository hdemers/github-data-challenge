import os

import webapp2
import jinja2

import dataviz.bigquery as bigquery

jinja_environment = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.join(os.path.dirname(__file__),
                                                "dataviz", "templates")))


class MainPage(webapp2.RequestHandler):
    def get(self):
        template_values = {}
        template = jinja_environment.get_template('index.html')
        self.response.out.write(template.render(template_values))


urls = [
    (r"^/bigquery/(top|repo)$", bigquery.Bigquery),
    (r"^/$", MainPage),
]

app = webapp2.WSGIApplication(urls, debug=True)
