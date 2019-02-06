import tempfile
import os
db_file = tempfile.NamedTemporaryFile()

mysql_user = os.environ['MYSQL_USER']
mysql_pw = os.environ['MYSQL_PASSWORD']
mysql_db = os.environ['MYSQL_DATABASE']
mysql_host = os.environ['MYSQL_DATABASE_HOST']

# TODO: also make the database port available dynamically via environment variable

class Config(object):
    SECRET_KEY = 'REPLACE ME'
    SQLALCHEMY_TRACK_MODIFICATIONS = False


class ProdConfig(Config):
    ENV = 'prod'
    SQLALCHEMY_DATABASE_URI = f'mysql://{mysql_user}:{mysql_pw}@{mysql_host}:3306/{mysql_db}'

    CACHE_TYPE = 'simple'


class DevConfig(Config):
    ENV = 'dev'
    DEBUG = True
    DEBUG_TB_INTERCEPT_REDIRECTS = False

    SQLALCHEMY_DATABASE_URI = f'mysql://{mysql_user}:{mysql_pw}@{mysql_host}:3306/{mysql_db}'

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

app_config = {
    'development': DevConfig,
    'testing': TestConfig,
    'staging': TestConfig,
    'production': ProdConfig
}
