import * as types from './types';
import Cookie from 'js-cookie';

// Actions for authentication
export const requestAuthLink = () => {
  return {
    type: types.REQUEST_AUTHENTICATION_LINK
  };
};
export const receiveAuthLink = (data) => {
  window.location = data.auth_url;
};
export const receiveAuthLinkError = (error) => {
  return {
    type: types.RECEIVE_AUTHENTICATION_LINK_ERROR,
    error: error
  };
};
export const authenticate = (provider) => {
  return dispatch => {
    dispatch(requestAuthLink());
    return fetch('/api/oauth/authenticate/' + encodeURIComponent(provider))
      .then(res => res.json())
      .then(
        (res) => res.success ? dispatch(receiveAuthLink(res.data)) : dispatch(receiveAuthLinkError(res.error)),
        (err) => dispatch(receiveAuthLinkError(err))
      );
  };
}
export const requestLogin = () => {
  return {
    type: types.REQUEST_LOGIN
  };
}
export const receiveLogin = (data) => {
  const cookie_opts = { path: '/', maxAge: data.expires_in };
  Cookie.set('_api_id', data.api_id, cookie_opts);
  Cookie.set('_api_secret', data.api_secret, cookie_opts);
  window.location.href = '/';
}
export const requestLoginError = (error) => {
  return {
    type: types.REQUEST_LOGIN_ERROR,
    error: error
  };
}
export const receiveLoginError = (error) => {
  return {
    type: types.RECEIVE_LOGIN_ERROR,
    error: error
  };
}
export const login = () => {
  return dispatch => {
    dispatch(requestLogin());
    var login_provider = window.location.pathname.replace('/login/', '').replace('/', '');
    if ( !login_provider ) {
      return receiveLoginError('Login provider not present in URL');
    }
    return fetch('/api/oauth/login/' + escape(login_provider), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        'authorization_response': window.location.href
      })})
      .then(res => res.json())
      .then(
        (res) => res.success ? dispatch(receiveLogin(res.data)) : dispatch(receiveLoginError(res.error)),
        (err) => dispatch(receiveLoginError(err))
      );
  }
}
export const requestLogout = () => {
  return {
    type: types.REQUEST_LOGOUT
  };
}
export const receiveLogout = (response) => {
  window.location.href = '/';
}
export const receiveLogoutError = (error) => {
  return {
    type: types.RECEIVE_LOGOUT_ERROR,
    error: error
  };
}
export const logout = () => {
  return (dispatch, getState) => {
    dispatch(requestLogout());
    const auth = getState().auth;
    dispatch(invalidateLogin())
    if ( !auth.isLoggedIn ) {
      return receiveLogoutError('You must be logged in to logout');
    }

    return fetch('/api/oauth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': auth.apiSecret },
      body: JSON.stringify({
        'api_id': auth.apiID
      })})
      .then(res => res.json())
      .then(
        (res) => res.success ? dispatch(receiveLogin(res.data)) : dispatch(receiveLogoutError(res.error)),
        (err) => dispatch(receiveLogoutError(err))
      );
  }
}
export const invalidateLogin = () => {
  return (dispatch, getState) => {
    return dispatch({ 'type': types.INVALIDATE_LOGIN });
  }
}


