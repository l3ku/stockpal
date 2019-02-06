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
from app.models import db, AppMetaData, LoggedInUser, User

iex_api_url = 'https://api.iextrading.com/1.0'

class ListGainers(Resource):
    def get(self):
        response = requests.get(iex_api_url + '/stock/market/list/gainers')
        return response.json()

class AllStocks(Resource):
    def get(self):
        # Get the stocks from a local file because making the API request every time would be
        # painfully slow...
        stocks_file = os.environ['APPDIR'] + '/app/json/all-stocks.json'
        if os.path.isfile(stocks_file):
            try:
                with open(stocks_file, 'r') as f:
                    stock_data = json.load(f)
                    return {'success': True, 'data': stock_data}
            except ValueError:
                pass
        return {'success': False, 'error': ''}


class UserInfo(Resource):
    def get(self, login_id):
        if login_id is None:
            return {'success': False, 'error': {'reason': 'missing_parameter', 'target': 'api_id'}}
        if 'X-API-Key' not in request.headers:
            return {'success': False, 'error': {'reason': 'missing_header', 'target': 'X-API-Key'}}
        login_secret = request.headers['X-API-Key']
        try:
            db_logged_in_user = LoggedInUser.query.filter_by(login_id=login_id).first()
            if db_logged_in_user is None:
                return {'success': False, 'error': {'reason': 'invalid_login', 'target': None}}
            success, response = db_logged_in_user.validateLogin(login_secret)
            if not success:
                return {'success': False, 'error': {'reason': response, 'target': None}}
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
            return {'success': False, 'error': {'reason': 'missing_header', 'target': 'X-API-Key'}}
        login_secret = request.headers['X-API-Key']
        try:
            return {'success': logout(login_id, login_secret)}
        except ValueError as err:
            return {'success': False, 'errors': [str(err)]}
        except AuthlibBaseError as err:
            return {'success': False, 'errors': [err.description]}
