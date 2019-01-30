import os
from authlib.client import OAuth2Session
from flask import request, session
from app.models import db, LoggedInUser, OAuth2Token
import requests
import random
import string

def getOAuth2ProviderData(auth_provider):
    oauth2_providers = {
        'google': {
            'auth_url': 'https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&prompt=consent',
            'access_token_url': 'https://www.googleapis.com/oauth2/v4/token',
            'session': {
                'client_id': os.environ['GOOGLE_OAUTH_CLIENT_ID'],
                'client_secret': os.environ['GOOGLE_OAUTH_CLIENT_SECRET'],
                'scope': 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email'
            }
        }
    }
    if auth_provider in oauth2_providers:
        return oauth2_providers[auth_provider]
    raise ValueError(f'Unknown OAuth provider: {auth_provider}')


def initOAuth2Session(auth_provider):
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
    oauth_token = oauth_session.fetch_access_token(provider_data['access_token_url'], authorization_response=auth_response)

    # Use the token to obtain user information
    user_name, user_email, user_picture = getUserInfoWithAcessToken(auth_provider, oauth_token['access_token'])

    # Generate login_id and login_secret for the user
    random_chars = string.printable
    login_id = ''.join(random.choice(random_chars) for i in range(20))
    login_secret = ''.join(random.choice(random_chars) for i in range(100))

    # Create or replace the user in the DB by his/her email
    db_user = LoggedInUser.query.filter_by(email=user_email).first()
    if db_user is None:
        db_user = LoggedInUser(login_id=login_id, login_secret=login_secret, name=user_name, email=user_email, picture_url=user_picture)
        db.session.add(db_user)
    else:
        db_user.login_id = login_id
        db_user.login_secret = login_secret
        db_user.name = user_name
        db_user.picture = user_picture

    # Save the OAuth2 token data to the database for the user. One user can only be logged in with
    # one OAuth2 provider at a time, so update any existing tokens if they exist
    db_oauth2_token = OAuth2Token.query.filter_by(user_id=db_user.id).first()
    if db_oauth2_token is None:
        db_oauth2_token = OAuth2Token(user_id=db_user.id, token_type=oauth_token['token_type'], access_token=oauth_token['access_token'], refresh_token=oauth_token['refresh_token'], expires_at=oauth_token['expires_at'])
        db.session.add(db_oauth2_token)
    else:
        db_oauth2_token.token_type = oauth_token['token_type']
        db_oauth2_token.access_token = oauth_token['access_token']
        db_oauth2_token.refresh_token = oauth_token['refresh_token']
        db_oauth2_token.expires_at = oauth_token['expires_at']

    # Apply changes to the database
    db.session.commit()

    # Return a login_id and login_secret that can be used to authenticate to this API
    return (login_id, login_secret)


def getUserInfoWithAcessToken(auth_provider, auth_token):
    name=email=picture=None
    # Handle different providers
    if auth_provider == 'google':
        payload = {'alt': 'json', 'access_token': auth_token}
        response = requests.get('https://www.googleapis.com/oauth2/v1/userinfo', params=payload).json()
        name = response['name']
        email = response['email']
        picture = response['picture']
    else:
        raise ValueError(f'Unknown OAuth provider: {auth_provider}')

    return (name, email, picture)
