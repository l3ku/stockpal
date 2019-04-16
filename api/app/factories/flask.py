# -*- coding: utf-8 -*-
from flask import Flask
from flask_migrate import Migrate
from app import db
from app.controller import main
from app.settings import app_config

def create_app(config=None, environment=None):
    if environment is None:
        environment = 'development'

    app = Flask(__name__)
    app.config.from_object(app_config[environment])

    # initialize SQLAlchemy
    db.init_app(app)
    migrate = Migrate(app, db)

    # register our blueprints
    app.register_blueprint(main)
    return app
