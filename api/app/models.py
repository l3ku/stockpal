import time
import random
import string
from app import db

class AppMetaData(db.Model):
    id = db.Column(db.Integer(), primary_key=True)
    type = db.Column(db.String(200), unique=True, nullable=False)
    value = db.Column(db.String(200))

    def __init__(self, type, value):
        self.type = type
        self.value = value

    def __repr__(self):
        return f'<AppMetaData type="{self.type}" value="{self.value}">'


class Stock(db.Model):
    symbol = db.Column(db.String(20), primary_key=True)
    name = db.Column(db.String(200), unique=False, nullable=False)
    type = db.Column(db.String(20), unique=False, nullable=False)
    is_enabled = db.Column(db.Boolean())

    def __init__(self, symbol, name, type, is_enabled):
        self.symbol = symbol
        self.name = name
        self.type = type
        self.is_enabled = is_enabled


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

    def getStocks(self):
        # We always ẃant to be nice and return the information of the stocks instead
        # of the plain IDs and delegating the SQL join type functionality outside of
        # this model.
        print(Stock.query.join(UserStock).filter_by(user_id=self.id).all())
        return Stock.query.join(UserStock).filter_by(user_id=self.id).all()

    def addStock(self, symbol):
        # Is this stock a valid stock?
        db_stock = Stock.query.filter_by(symbol=symbol).first()
        if db_stock is None:
            return (False, {'reason': f'Unknown stock symbol: "{symbol}"','target': None})

        # Does the user already have this stock?
        user_stock = UserStock.query.filter_by(user_id=self.id, stock_symbol=symbol).first()
        if user_stock is not None:
            return (False, {'reason': f'Stock "{symbol}" already exists for this user', 'target': None})

        user_stock = UserStock(self.id, symbol)
        db.session.add(user_stock)
        db.session.commit()
        return { 'success': True }

    def deleteStock(self, symbol):
        # Is this stock a valid stock?
        db_stock = Stock.query.filter_by(symbol=symbol).first()
        if db_stock is None:
            return (False, {'reason': f'Unknown stock symbol: "{symbol}"','target': None})

        # Does the user even have this stock?
        user_stock = UserStock.query.filter_by(user_id=self.id, stock_symbol=symbol).first()
        if user_stock is None:
            return (False, {'reason': f'User does not have stock "{symbol}"', 'target': None})

        # Finally, perform actual deletion
        db.session.delete(user_stock)
        db.session.commit()
        return { 'success': True }
##
# Models the one-to-many User(1) -> Stock(N) relationship.
##
class UserStock(db.Model):
    user_id = db.Column(db.Integer(), db.ForeignKey(User.id, onupdate='CASCADE', ondelete='CASCADE'), primary_key=True, nullable=False)
    stock_symbol = db.Column(db.String(20), db.ForeignKey(Stock.symbol, onupdate='CASCADE', ondelete='CASCADE'), primary_key=True, nullable=False)

    def __init__(self, user_id, stock_symbol):
        self.user_id = user_id
        self.stock_symbol = stock_symbol


class LoggedInUser(db.Model):
    user_id = db.Column(db.Integer(), db.ForeignKey(User.id, onupdate='CASCADE', ondelete='CASCADE'), primary_key=True, nullable=False)
    login_id = db.Column(db.String(200), unique=True, nullable=False)
    login_secret = db.Column(db.String(1000), unique=False, nullable=False)
    expires_at = db.Column(db.Integer(), default=0)

    def __init__(self, user_id, expire_time):
        self.user_id = user_id
        self.resetUserLogin(expire_time=expire_time)

    def resetUserLogin(self, expire_time, id_length=20, secret_length=200):
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
            return (False, {'reason': 'invalid_login', 'target': None})
        # 2. Check that the login has not expired
        elif time.time() >= self.expires_at:
            return (False, {'reason': 'login_expired', 'target': None})
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
