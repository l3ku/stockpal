import os
from authlib.client import OAuth2Session
from flask import request, session

def getOAuth2ProviderData(auth_provider):
    oauth2_providers = {
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
    if auth_provider in oauth2_providers:
        return oauth2_providers[auth_provider]
    raise ValueError(f'Unknown OAuth provider: {auth_provider}')


def getOAuth2LoginURL(auth_provider):
    provider_data = getOAuth2ProviderData(auth_provider)
    provider_data['session']['redirect_uri'] = request.url_root + 'login/' + auth_provider
    oauth_session = OAuth2Session(**provider_data['session'])
    url, state = oauth_session.create_authorization_url(provider_data['auth_url'])
    session[f'{auth_provider}_oauth_state'] = state
    return url


def OAuth2Login(auth_provider, auth_response):
    provider_data = getOAuth2ProviderData(auth_provider)
    redirect_uri = request.url_root + 'login/' + auth_provider
    oauth_session = OAuth2Session(provider_data['session']['client_id'], provider_data['session']['client_secret'], state=session[f'{auth_provider}_oauth_state'], redirect_uri=redirect_uri)

    # TODO: save this token to the database for access
    token = oauth_session.fetch_access_token(provider_data['access_token_url'], authorization_response=auth_response)
    return True
