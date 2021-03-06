# -*- coding: utf-8 -*-
import tempfile
import os
db_file = tempfile.NamedTemporaryFile()

mysql_user = os.environ['MYSQL_USER']
mysql_pw = os.environ['MYSQL_PASSWORD']
mysql_db = os.environ['MYSQL_DATABASE']
mysql_host = os.environ['MYSQL_DATABASE_HOST']
db_address = f'{mysql_user}:{mysql_pw}@{mysql_host}:3306/{mysql_db}'
mysql_uri = f'mysql://{db_address}'
# TODO: also make the database port available dynamically via environment variable

class Config(object):
    SECRET_KEY = 'REPLACE ME'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = mysql_uri
    SQLALCHEMY_POOL_RECYCLE = 499
    SQLALCHEMY_POOL_TIMEOUT = 20

class ProdConfig(Config):
    ENV = 'prod'
    CACHE_TYPE = 'simple'


class DevConfig(Config):
    ENV = 'dev'
    DEBUG = True
    DEBUG_TB_INTERCEPT_REDIRECTS = False

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
