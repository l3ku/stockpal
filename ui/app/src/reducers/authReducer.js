import {
  REQUEST_LOGIN,
  RECEIVE_LOGIN,
  RECEIVE_LOGIN_ERROR,
  REQUEST_LOGOUT,
  RECEIVE_LOGOUT,
  RECEIVE_LOGOUT_ERROR
} from '../actions/types';
import Cookie from 'js-cookie';


const initialState = {
  // The initial state should "preload" the API ID and secret values so they no longer
  // have to be retreived from the Cookies anywhere else.
  apiID: Cookie.get('_api_id') ? Cookie.get('_api_id') : null,
  apiSecret: Cookie.get('_api_secret') ? Cookie.get('_api_secret') : null,
  isAuthRedirect: window.location.pathname.includes('/login/'),
  isLoggedIn: Cookie.get('_api_id') && Cookie.get('_api_secret'),
  error: null
};

export default function(state=initialState, action) {
  switch ( action.type ) {
    case RECEIVE_LOGIN:
      const cookie_opts = {path: '/', maxAge: action.expires_in};
      Cookie.set('_api_id', action.apiID, cookie_opts);
      Cookie.set('_api_secret', action.apiSecret, cookie_opts);
      return {
        ...state,
        success: true,
        error: null,
        apiID: action.apiID,
        apiSecret: action.apiSecret
      };
    case RECEIVE_LOGIN_ERROR:
      return {
        ...state,
        success: false,
        error: action.error,
        isAuthRedirect: false
      };
    default:
      return state;
  }
};
