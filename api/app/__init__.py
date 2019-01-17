#! ../env/bin/python

from flask import Flask

from app.models import db
from app.controller import main

from app.extensions import (
    login_manager
)


def create_app(object_name):
    """
    An flask application factory, as explained here:
    http://flask.pocoo.org/docs/patterns/appfactories/

    Arguments:
        object_name: the python path of the config object,
                     e.g. app.settings.ProdConfig
    """

    app = Flask(__name__)

    app.config.from_object(object_name)

    # initialize SQLAlchemy
    db.init_app(app)

    login_manager.init_app(app)

    # register our blueprints
    app.register_blueprint(main)

    return app
