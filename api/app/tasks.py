from celery import Celery
import os
from app.create import create_app

def create_celery(celery, app):
    celery.conf.update(app.config)
    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)
    celery.Task = ContextTask
    return celery

flask_app = create_app()
celery_app = Celery('app.create', broker='redis://redis:6379')
celery_app = create_celery(celery_app, flask_app)

@celery_app.task
def add(x, y):
    return x + y

add.delay(4, 4)
