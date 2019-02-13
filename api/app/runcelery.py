from app import celery
from app.factories.flask import create_app
from app.factories.celery import create_celery

application = create_app()
celery = create_celery(celery, application)
