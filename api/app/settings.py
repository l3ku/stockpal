import tempfile
import os
db_file = tempfile.NamedTemporaryFile()

mysql_user = os.environ['MYSQL_USER']
mysql_pw = os.environ['MYSQL_PASSWORD']
mysql_db = os.environ['MYSQL_DATABASE']

class Config(object):
    SECRET_KEY = 'REPLACE ME'


class ProdConfig(Config):
    ENV = 'prod'
    SQLALCHEMY_DATABASE_URI = f'mysql://{mysql_user}:{mysql_pw}@db:3306/{mysql_db}'

    CACHE_TYPE = 'simple'


class DevConfig(Config):
    ENV = 'dev'
    DEBUG = True
    DEBUG_TB_INTERCEPT_REDIRECTS = False

    SQLALCHEMY_DATABASE_URI = f'mysql://{mysql_user}:{mysql_pw}@db:3306/{mysql_db}'

    CACHE_TYPE = 'null'
    ASSETS_DEBUG = True


class TestConfig(Config):
    ENV = 'test'
    DEBUG = True
    DEBUG_TB_INTERCEPT_REDIRECTS = False

    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + db_file.name
    SQLALCHEMY_ECHO = True

    CACHE_TYPE = 'null'
    WTF_CSRF_ENABLED = False
