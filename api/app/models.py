from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class LoggedInUser(db.Model):
    id = db.Column(db.Integer(), primary_key=True)
    login_id = db.Column(db.String(200), unique=True, nullable=False)
    login_secret = db.Column(db.String(1000), unique=False, nullable=False)
    name = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    picture_url = db.Column(db.String(200), unique=False, nullable=True)

    def __init__(self, login_id, login_secret, name, email, picture_url):
        self.login_id = login_id
        self.login_secret = login_secret
        self.name = name
        self.email = email
        self.picture_url = picture_url

    def is_active(self):
        return True

    def get_id(self):
        return self.id

    def __repr__(self):
        return '<User %r>' % self.username

class OAuth2Token(db.Model):
    user_id = db.Column(db.Integer(), db.ForeignKey(LoggedInUser.id), primary_key=True, nullable=False)
    token_type = db.Column(db.String(2000))
    access_token = db.Column(db.String(1000), nullable=False)
    refresh_token = db.Column(db.String(1000))
    expires_at = db.Column(db.Integer(), default=0)

    def __init__(self, user_id, token_type, access_token, refresh_token, expires_at):
        self.user_id = user_id
        self.token_type = token_type
        self.access_token = access_token
        self.refresh_token = refresh_token
        self.expires_at = expires_at
