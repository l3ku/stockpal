from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import time
import random
import string

db = SQLAlchemy()

class AppMetaData(db.Model):
    id = db.Column(db.Integer(), primary_key=True)
    type = db.Column(db.String(200), unique=True, nullable=False)
    value = db.Column(db.String(200))

    def __init__(self, type, value):
        self.type = type
        self.value = value

    def __repr__(self):
        return f'<AppMetaData type:"{self.type}";value:"{self.value}"'


class User(db.Model):
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    picture_url = db.Column(db.String(200), unique=False, nullable=True)

    def __init__(self, name, email, picture_url):
        self.name = name
        self.email = email
        self.picture_url = picture_url

    def __repr__(self):
        return '<User %r>' % self.name

class Stock(db.Model):
    id = db.Column(db.Integer(), primary_key=True)
    symbol = db.Column(db.String(20), unique=True, nullable=False)
    name = db.Column(db.String(200), unique=False, nullable=False)
    is_enabled = db.Column(db.Boolean())

    def __init__(self, symbol, name, is_enabled):
        self.symbol = symbol
        self.name = name
        self.is_enabled = is_enabled


class LoggedInUser(db.Model):
    user_id = db.Column(db.Integer(), db.ForeignKey(User.id, onupdate='CASCADE', ondelete='CASCADE'), primary_key=True, nullable=False)
    login_id = db.Column(db.String(200), unique=True, nullable=False)
    login_secret = db.Column(db.String(1000), unique=False, nullable=False)
    expires_at = db.Column(db.Integer(), default=0)

    def __init__(self, user_id, expire_time):
        self.user_id = user_id
        self.resetUserLogin(expire_time=expire_time)

    def resetUserLogin(self, expire_time, id_length=100, secret_length=500):
        # Ensure that the login_id is unique in the DB by iterating until a unique one is found.
        # If login_id length is big, there is an extremely low chance that this loop will be executed
        # many times.
        while True:
            login_id = ''.join(random.choice(string.digits + string.ascii_letters) for i in range(id_length))
            if self.query.filter_by(login_id=login_id).first() is None:
                break

        # Login secrets need not to be unique.
        login_secret = ''.join(random.choice(string.digits + string.ascii_letters + string.punctuation) for i in range(secret_length))

        # Set the values into the model itself.
        self.login_id = login_id
        self.login_secret = login_secret
        self.expires_at = time.time() + expire_time

    def validateLogin(self, login_secret):
        # 1. Check that the login_secret is valid
        if login_secret is None or self.login_secret != login_secret:
            return (False, 'invalid_login')
        # 2. Check that the login has not expired
        elif time.time() >= self.expires_at:
            return (False, 'login_expired')
        else:
            return (True, User.query.filter_by(id=self.user_id).first())


class OAuth2Token(db.Model):
    user_id = db.Column(db.Integer(), db.ForeignKey(LoggedInUser.user_id, onupdate='CASCADE', ondelete='CASCADE'), primary_key=True, nullable=False)
    provider = db.Column(db.String(50))
    token_type = db.Column(db.String(2000))
    access_token = db.Column(db.String(1000), nullable=False)
    refresh_token = db.Column(db.String(1000))
    expires_at = db.Column(db.Integer(), default=0)

    def __init__(self, user_id, provider, token_type, access_token, refresh_token, expires_at):
        self.user_id = user_id
        self.provider = provider
        self.token_type = token_type
        self.access_token = access_token
        self.refresh_token = refresh_token
        self.expires_at = expires_at
