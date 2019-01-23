from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer(), primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=False, nullable=False)
    password = db.Column(db.String(200), unique=False, nullable=False)

    def __init__(self, username, password):
        self.username = username
        self.set_password(password)

    def is_active(self):
        return True

    def get_id(self):
        return self.id

    def __repr__(self):
        return '<User %r>' % self.username

class OAuth2Token(db.Model):
    user_id = db.Column(db.Integer(), db.ForeignKey(User.id), primary_key=True, nullable=False)
    name = db.Column(db.String(20), nullable=False)

    token_type = db.Column(db.String(20))
    access_token = db.Column(db.String(48), nullable=False)
    refresh_token = db.Column(db.String(48))
    expires_at = db.Column(db.Integer(), default=0)

    def to_token(self):
        return dict(
            access_token=self.access_token,
            token_type=self.token_type,
            refresh_token=self.refresh_token,
            expires_at=self.expires_at,
        )
