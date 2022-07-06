import flask_dictabase
from flask import Flask,redirect
from flask_login_dictabase_blueprint import bp, SignedIn

import tracker
import api
import config

app = Flask('Secure Cycle Tracking')

app.db = flask_dictabase.Dictabase(app)

app.config["SECRET_KEY"] = config.SECRET_KEY
app.register_blueprint(bp)


@SignedIn
def signed_in_callback(user):
    print('signed_in_callback(', user)


@app.route('/')
def index():
    return redirect('/tracker')


api.setup(app)
tracker.setup(app)

if __name__ == '__main__':
    app.run(debug=True)
