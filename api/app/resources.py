import re
import json
import time
import json
import os
from flask import request
from flask_restful import Resource, reqparse
import requests
from app.auth import initOAuth2Session, OAuth2Login, logout
from authlib.common.errors import AuthlibBaseError
from app.models import db, AppMetaData, LoggedInUser, User, Stock
from app.tasks import updateStocksFromAPI
from urllib.parse import quote
import app.ml

iex_api_url = 'https://api.iextrading.com/1.0'


# TODO: this could be moved elsewhere
def authenticate(login_id):
    if login_id is None:
        return (False, {'reason': 'missing_parameter', 'target': 'api_id'})
    if 'X-API-Key' not in request.headers:
        return (False, {'reason': 'missing_header', 'target': 'X-API-Key'})
    login_secret = request.headers['X-API-Key']
    db_logged_in_user = LoggedInUser.query.filter_by(login_id=login_id).first()
    if db_logged_in_user is None:
        return (False, {'reason': 'invalid_login', 'target': None})
    else:
        return db_logged_in_user.validateLogin(login_secret)

class ListGainers(Resource):
    def get(self):
        response = requests.get(iex_api_url + '/stock/market/list/gainers')
        return {'success': True, 'data': response.json()}


class StockInfo(Resource):
    def get(self, symbol=None):
        # Just return all stocks if no single symbol was provided
        if symbol is None:
            stocks_db_result = Stock.query.all()
        else:
            stocks_db_result = Stock.query.filter_by(symbol=symbol)

        # Collect the information inside a list of dicts
        return_data = []
        for stock in stocks_db_result:
            return_data.append({'symbol': stock.symbol, 'name': stock.name, 'type': stock.type, 'is_enabled': stock.is_enabled})
        return {'success': True, 'data': return_data}

    def post(self):
        updateStocksFromAPI.delay()


class StockChart(Resource):
    def get(self, symbol):
        symbol_esc = quote(symbol, safe='')
        parser = reqparse.RequestParser()
        parser.add_argument('range')
        args = parser.parse_args()
        interval = quote(args['range']) if args['range'] else '5y'
        response = requests.get(iex_api_url + f'/stock/{symbol_esc}/chart/{interval}')
        return {'success': True, 'data': response.json()}


class UserInfo(Resource):
    def get(self, login_id):
        try:
            success, obj = authenticate(login_id)
            if not success:
                return {'success': False, 'error': obj}
            db_user = obj # In case of success we know that obj is the DB model user instead of error object
            return {'success': True, 'data': {'user_name': db_user.name, 'user_email': db_user.email, 'user_picture_url': db_user.picture_url}}
        except ValueError as err:
            return {'success': False, 'error': {'reason': str(err), 'target': None}}
        except AuthlibBaseError as err:
            return {'success': False, 'error': {'reason': 'err.description', 'target': None}}


class UserStocks(Resource):
    def get(self, login_id):
        try:
            success, obj = authenticate(login_id)
            if not success:
                return {'success': False, 'error': obj}
            db_user = obj # In case of success we know that obj is the DB model user instead of error object
            stocks = db_user.getStocks()
             # Collect the information inside a list of dicts
            return_data = []
            for stock in stocks:
                return_data.append({'symbol': stock.symbol, 'name': stock.name, 'type': stock.type, 'is_enabled': stock.is_enabled})
            return {'success': True, 'data': return_data}
        except ValueError as err:
            return {'success': False, 'error': {'reason': str(err), 'target': None}}
        except AuthlibBaseError as err:
            return {'success': False, 'error': {'reason': 'err.description', 'target': None}}

    def post(self, login_id):
        try:
            success, obj = authenticate(login_id)
            if not success:
                return {'success': False, 'error': obj}
            db_user = obj # In case of success we know that obj is the DB model user instead of error object
            parser = reqparse.RequestParser()
            parser.add_argument('stock_symbols', action='append', required=True, help="Stock symbols are required")
            args = parser.parse_args()
            stock_symbols = args['stock_symbols']
            print(stock_symbols)
            if not isinstance(stock_symbols, list):
                return {'success': False, 'error': 'Stock symbols should be provided in a list'}
            return db_user.addStocks(stock_symbols)

        except ValueError as err:
            return {'success': False, 'error': {'reason': str(err), 'target': None}}
        except AuthlibBaseError as err:
            return {'success': False, 'error': {'reason': err.description, 'target': None}}

    def delete(self, login_id):
        try:
            success, obj = authenticate(login_id)
            if not success:
                return {'success': False, 'error': obj}
            db_user = obj # In case of success we know that obj is the DB model user instead of error object
            parser = reqparse.RequestParser()
            parser.add_argument('stock_symbol', required=True, help="Stock symbol is required")
            args = parser.parse_args()
            return db_user.deleteStock(args['stock_symbol'])

        except ValueError as err:
            return {'success': False, 'error': {'reason': str(err), 'target': None}}
        except AuthlibBaseError as err:
            return {'success': False, 'error': {'reason': err.description, 'target': None}}


class Authenticate(Resource):
    def get(self, auth_provider):
        try:
            return {'success': True, 'data': {'auth_url': initOAuth2Session(auth_provider)}}
        except ValueError as err:
            return {'success': False, 'error': str(err)}
        except AuthlibBaseError as err:
            return {'success': False, 'error': err.description}


class Login(Resource):
    def post(self, auth_provider):
        parser = reqparse.RequestParser()
        parser.add_argument('authorization_response', required=True, help="Authorization server response is required")
        args = parser.parse_args()
        auth_response = args['authorization_response']
        try:
            login_id, login_secret, login_expires_in = OAuth2Login(auth_provider, auth_response)
            return {'success': True, 'data': {'api_id': login_id, 'api_secret': login_secret, 'expires_in': login_expires_in}}
        except ValueError as err:
            return {'success': False, 'error': str(err)}
        except AuthlibBaseError as err:
            return {'success': False, 'error': err.description}


class Logout(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('api_id', required=True, help="API ID is required")
        args = parser.parse_args()
        login_id = args['api_id']
        if not 'X-API-Key' in request.headers:
            return {'success': False, 'error': {'reason': 'missing_header', 'target': 'X-API-Key'}}
        login_secret = request.headers['X-API-Key']
        try:
            return {'success': logout(login_id, login_secret)}
        except ValueError as err:
            return {'success': False, 'error': str(err)}
        except AuthlibBaseError as err:
            return {'success': False, 'error': err.description}
