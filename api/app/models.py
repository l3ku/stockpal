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
