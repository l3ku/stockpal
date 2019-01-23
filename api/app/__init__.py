#! ../env/bin/python

from flask import Flask
from flask_migrate import Migrate

from app.models import db
from app.controller import main


def create_app(object_name):
    app = Flask(__name__)
    app.config.from_object(object_name)

    # initialize SQLAlchemy
    db.init_app(app)
    migrate = Migrate(app, db)

    # register our blueprints
    app.register_blueprint(main)
    return app
