import re
import json
from datetime import datetime, timedelta
from flask import request
from flask_restful import Resource, reqparse
import requests
from app.auth import initOAuth2Session, OAuth2Login, logout
from authlib.common.errors import AuthlibBaseError

iex_api_url = 'https://api.iextrading.com/1.0'

class ListGainers(Resource):
    def get(self):
        response = requests.get(iex_api_url + '/stock/market/list/gainers')
        return response.json()

class StockHistory(Resource):
    def get(self, stock_symbol):
        end = datetime.today()
        start = end - timedelta(days=365)
        return ''

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
            login_id, login_secret = OAuth2Login(auth_provider, auth_response)
            return {'success': True, 'data': {'api_id': login_id, 'api_secret': login_secret}}
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
