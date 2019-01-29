import re
import json
from datetime import datetime, timedelta
from flask_restful import Resource, reqparse
import requests
from app.auth import getOAuth2LoginURL, OAuth2Login
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
            return {'success': True, 'data': {'auth_url': getOAuth2LoginURL(auth_provider)}}
        except ValueError as err:
            return {'success': False, 'errors': [err]}
        except AuthlibBaseError as err:
            return {'success': False, 'errors': [err.description]}

class Login(Resource):
    def post(self, auth_provider):
        parser = reqparse.RequestParser()
        parser.add_argument('authorization_response', required=True, help="Authorization server response is required")
        args = parser.parse_args()
        auth_response = args['authorization_response']
        try:
            success = OAuth2Login(auth_provider, auth_response)
            return {'success': success}
        except ValueError as err:
            return {'success': False, 'errors': [err]}
        except AuthlibBaseError as err:
            return {'success': False, 'errors': [err.description]}
