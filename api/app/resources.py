import os
import json
from datetime import datetime, timedelta
from flask_restful import Resource
import requests
from authlib.client import OAuth2Session

iex_api_url = 'https://api.iextrading.com/1.0'

class ListMostActive(Resource):
    def get(self):
        response = requests.get(iex_api_url + '/stock/market/list/mostactive')
        return response.json()

class StockHistory(Resource):
    def get(self, stock_symbol):
        end = datetime.today()
        start = end - timedelta(days=365)
        return ''

class Login(Resource):
    def get(self, provider):
        response = {}
        if provider == 'google':
            session = OAuth2Session(
                client_id=os.environ['GOOGLE_OAUTH_CLIENT_ID'],
                client_secret=os.environ['GOOGLE_OAUTH_CLIENT_SECRET'],
                scope='https://www.googleapis.com/auth/userinfo.profile',
                access_token_url='https://www.googleapis.com/oauth2/v4/token',
                redirect_uri='http://localhost:8080'
            )
            url, state = session.create_authorization_url('https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&prompt=consent')
            response = {'success': True, 'data': {'auth_url': url}}
        else:
            response = {'success': False, 'errors': [f'Unknown provider: {provider}']}
        return response

class Authenticate(Resource):
    def get(self):
        return ''
