from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import time
import random
import string

db = SQLAlchemy()

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


class LoggedInUser(db.Model):
    user_id = db.Column(db.Integer(), db.ForeignKey(User.id, onupdate='CASCADE', ondelete='CASCADE'), primary_key=True, nullable=False)
    login_id = db.Column(db.String(200), unique=True, nullable=False)
    login_secret = db.Column(db.String(1000), unique=False, nullable=False)
    expires_at = db.Column(db.Integer(), default=0)

    def __init__(self, user_id, expire_time=604800):
        self.user_id = user_id
        self.resetUserLogin(expire_time=expire_time)

    def resetUserLogin(self, expire_time, id_length=100, secret_length=500):
        # Generate login_id and login_secret for the user.
        random_chars = string.digits + string.ascii_letters + string.punctuation

        # Ensure that the login_id is unique in the DB by iterating until a unique one is found.
        # If login_id length is big, there is an extremely low chance that this loop will be executed
        # many times.
        while True:
            login_id = ''.join(random.choice(random_chars) for i in range(id_length))
            if self.query.filter_by(login_id=login_id).first() is None:
                break

        # Login secrets need not to be unique.
        login_secret = ''.join(random.choice(random_chars) for i in range(secret_length))

        # Set the values into the model itself.
        self.login_id = login_id
        self.login_secret = login_secret
        self.expires_at = time.time() + expire_time


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
