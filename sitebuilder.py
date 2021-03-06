from flask import Flask, render_template
from flask_flatpages import FlatPages
from flask_frozen import Freezer
import os, sys

app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

freezer = Freezer(app)


@app.route('/')
def index():
    return render_template("main.html")


@app.after_request
def add_header(response):
    """
    Add headers to both force latest IE rendering engine or Chrome Frame,
    and also to cache the rendered page for 10 minutes.
    """
    response.headers['X-UA-Compatible'] = 'IE=Edge,chrome=1'
    response.headers['Cache-Control'] = 'public, max-age=0'
    return response



if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "build":
        # Builds the website into a static site and runs "firebase deploy" to update the site
        if len(sys.argv) > 2 and sys.argv[2] == "local":
            app.config["FREEZER_DESTINATION"] = "/fbdir/public"
            freezer.freeze()
        else:
            freezer.freeze()
    else:
        app.run(port=8000)