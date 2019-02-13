from celery import Celery

CELERY_TASK_LIST = [
    'app.tasks'
]

celery = Celery('app', broker='redis://redis:6379', backend='redis://redis:6379', include=CELERY_TASK_LIST)
