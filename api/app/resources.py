import re
import json
import time
from flask import request
from flask_restful import Resource, reqparse
import requests
from app.auth import initOAuth2Session, OAuth2Login, logout
from authlib.common.errors import AuthlibBaseError
from app.models import *

iex_api_url = 'https://api.iextrading.com/1.0'

class ListGainers(Resource):
    def get(self):
        response = requests.get(iex_api_url + '/stock/market/list/gainers')
        return response.json()

class AllStocks(Resource):
    def get(self):
        # Update the stocks listing every hour from IEX upstream
        db_last_updated_meta_data = AppMetaData.query.filter_by(type='all_stocks_update_time').first()
        if db_last_updated_meta_data is None:
            stock_data = getAndUpdateStocksFromAPI()
            # Insert the last updation meta data and commit to these changes.
            db_last_updated_meta_data = AppMetaData('all_stocks_update_time', str(time.time()))
            db.session.commit()
        else:
            stock_data = Stock.query.all()
            updation_time = int(db_last_updated_meta_data.value)
            one_hour_ago = time.time() - 3600
            if updation_time <= one_hour_ago or all_stocks is None:
                stock_data = self.getAndUpdateStocksFromAPI()
                db.session.commit()
            return stock_data

    def getAndUpdateStocksFromAPI():
        return_val = []
        response = requests.get(iex_api_url + '/ref-data/symbols')
        all_stocks = response.json()
        for stock in all_stocks:
            db_stock = Stock.query.filter_by(symbol=stock['symbol']).first()
            if db_stock is None:
                db_stock = Stock(symbol=stock['symbol'], name=stock['name'], is_enabled=stock['isEnabled'])
            else:
                db_stock.symbol = stock['symbol']
                db_stock.name = stock['name']
                db_stock.is_enabled = stock['isEnabled']
            return_val.append({'symbol': stock['symbol'], 'name': stock['name'], 'is_enabled': stock['isEnabled']})
        return return_val


class UserInfo(Resource):
    def get(self, login_id):
        if login_id is None or 'X-API-Key' not in request.headers:
            return {'success': False, 'error': {'reason': 'missing_parameter'}}
        login_secret = request.headers['X-API-Key']
        try:
            db_logged_in_user = LoggedInUser.query.filter_by(login_id=login_id).first()
            if db_logged_in_user is None:
                return {'success': False, 'error': {'reason': 'invalid_login'}}
            success, response = db_logged_in_user.validateLogin(login_secret)
            if not success:
                return {'success': False, 'error': {'reason': response}}
            db_user = response
            return {'success': True, 'data': {'user_name': db_user.name, 'user_email': db_user.email, 'user_picture_url': db_user.picture_url}}
        except ValueError as err:
            return {'success': False, 'error': {'reason': str(err)}}
        except AuthlibBaseError as err:
            return {'success': False, 'errors': [err.description]}

class Authenticate(Resource):
    def get(self, auth_provider):
        try:
            return {'success': True, 'data': {'auth_url': initOAuth2Session(auth_provider)}}
        except ValueError as err:
            return {'success': False, 'errors': [str(err)]}
        except AuthlibBaseError as err:
            return {'success': False, 'errors': [err.description]}

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
            return {'success': False, 'errors': [str(err)]}
        except AuthlibBaseError as err:
            return {'success': False, 'errors': [err.description]}

class Logout(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('api_id', required=True, help="API ID is required")
        args = parser.parse_args()
        login_id = args['api_id']
        if not 'X-API-Key' in request.headers:
            return {'success': False, 'errors': ['Access denied: X-API-Key is missing']}
        login_secret = request.headers['X-API-Key']
        try:
            return {'success': logout(login_id, login_secret)}
        except ValueError as err:
            return {'success': False, 'errors': [str(err)]}
        except AuthlibBaseError as err:
            return {'success': False, 'errors': [err.description]}
