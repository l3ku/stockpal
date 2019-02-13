def create_celery(celery, app):
    celery.conf.update(app.config)
    celery.conf.beat_schedule = {
        'update-stocks-every-hour': {
            'task': 'app.tasks.updateStocksFromAPI',
            'schedule': 3600,
        },
    }
    TaskBase = celery.Task

    class ContextTask(TaskBase):
        abstract = True
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return TaskBase.__call__(self, *args, **kwargs)

    celery.Task = ContextTask
    return celery
