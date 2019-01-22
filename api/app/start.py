import os
from app import create_app
from app.models import db

# default to dev config because no one should use this in
# production anyway
env = os.environ.get('APP_ENV', 'dev')
app = create_app('app.settings.%sConfig' % env.capitalize())

if __name__ == "__main__":
    app.run()
    db.create_all()
