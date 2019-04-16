# -*- coding: utf-8 -*-
import os
from authlib.client import OAuth2Session
from flask import request, session
from app.models import db, User, LoggedInUser, OAuth2Token
import requests

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

    # Create the user in the DB if a user with the provided email does not exist. However, do not
    # update the data of the user yet because there should be a separate update mechanism for this
    # on e.g. the user "My Account" page.
    db_user = User.query.filter_by(email=user_email).first()
    if db_user is None:
        db_user = User(name=user_name, email=user_email, picture_url=user_picture)
        db.session.add(db_user)

    # NOTE: the user id is generated during the commit, so we need to run db.session.commit() before
    # retrieving the id.
    db.session.commit()
    db_user_id = db_user.id

    # How long should this login be valid for?
    login_expire_time = 604800

    # Check if the user is already logged in. If so, just reset the user login.
    db_logged_in_user = LoggedInUser.query.filter_by(user_id=db_user_id).first()
    if db_logged_in_user is None:
        db_logged_in_user = LoggedInUser(user_id=db_user_id, expire_time=login_expire_time)
        db.session.add(db_logged_in_user)
    else:
        db_logged_in_user.resetUserLogin(expire_time=login_expire_time)

    api_secret = db_logged_in_user.api_secret
    login_expires_at = db_logged_in_user.expires_at

    # Save the OAuth2 token data to the database for the user. One user can only be logged in with
    # one OAuth2 provider at a time, so update any existing tokens if they exist
    db_oauth2_token = OAuth2Token.query.filter_by(user_id=db_user_id).first()
    if db_oauth2_token is None:
        db_oauth2_token = OAuth2Token(
            user_id=db_user_id,
            provider=auth_provider,
            token_type=oauth_token['token_type'],
            access_token=oauth_token['access_token'],
            refresh_token=oauth_token['refresh_token'],
            expires_at=oauth_token['expires_at']
        )
        db.session.add(db_oauth2_token)
    else:
        db_oauth2_token.token_type = auth_provider
        db_oauth2_token.token_type = oauth_token['token_type']
        db_oauth2_token.access_token = oauth_token['access_token']
        db_oauth2_token.refresh_token = oauth_token['refresh_token']
        db_oauth2_token.expires_at = oauth_token['expires_at']

    # Apply changes to the database
    db.session.commit()

    # Return login_id, login_secret and login expire time that can be used to
    # authenticate to this API. NOTE: be sure to return the relative time in
    # seconds when the login expires, so the client can set the cookies for x
    # seconds without having to face any timezone issues.
    return (api_secret, login_expire_time)


def logout(api_secret):
    db_user = LoggedInUser.query.filter_by(api_secret=api_secret).first()
    if db_user is None or api_secret != db_user.api_secret:
        raise ValueError('Invalid login_id or login_secret')
    db.session.delete(db_user)
    db.session.commit()
    return True


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
