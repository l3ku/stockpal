import os
import re
import json
from datetime import datetime, timedelta
from flask import request, session
from flask_restful import Resource, reqparse
import requests
from authlib.client import OAuth2Session

iex_api_url = 'https://api.iextrading.com/1.0'

oauth_providers = {
    'google': {
        'auth_url': 'https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&prompt=consent',
        'access_token_url': 'https://www.googleapis.com/oauth2/v4/token',
        'session': {
            'client_id': os.environ['GOOGLE_OAUTH_CLIENT_ID'],
            'client_secret': os.environ['GOOGLE_OAUTH_CLIENT_SECRET'],
            'scope': 'https://www.googleapis.com/auth/userinfo.profile'
        }
    }
}

class ListMostActive(Resource):
    def get(self):
        response = requests.get(iex_api_url + '/stock/market/list/mostactive')
        return response.json()

class StockHistory(Resource):
    def get(self, stock_symbol):
        end = datetime.today()
        start = end - timedelta(days=365)
        return ''

class Authenticate(Resource):
    def get(self, auth_provider):
        if auth_provider in oauth_providers:
            provider_data = oauth_providers[auth_provider]
            provider_data['session']['redirect_uri'] = request.url_root
            oauth_session = OAuth2Session(**provider_data['session'])
            url, state = oauth_session.create_authorization_url(provider_data['auth_url'])
            session[f'{auth_provider}_oauth_state'] = state
            return {'success': True, 'data': {'auth_url': url}}

        return {'success': False, 'errors': [f'Unknown OAuth provider: {auth_provider}']}

class Login(Resource):
    def post(self, auth_provider):
        parser = reqparse.RequestParser()
        parser.add_argument('authorization_response', type=string, required=True, help="Authorization server response is required")
        args = parser.parse_args()
        authorization_response = args['authorization_response']
        response = {}

        if auth_provider in oauth_providers:
            provider_data = oauth_providers[auth_provider]
            oauth_session = OAuth2Session(provider_data['session']['client_id'], provider_data['session']['client_secret'], state=session[f'{auth_provider}_oauth_state'])
            token = oauth_session.fetch_access_token(access_token_url, authorization_response=authorization_response)
            # TODO: save this token to the database for access
            return {'success': True, 'data': {'token': token}}

        return {'success': False, 'errors': [f'Unknown OAuth provider: {auth_provider}']}
