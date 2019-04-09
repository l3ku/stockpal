import * as types from './types';
import { invalidateLogin } from './authActions';

const requestUserInfo = () => {
  return {
    type: types.REQUEST_USER_INFO
  };
};
const receiveUserInfo = (response) => {
  return {
    type: types.RECEIVE_USER_INFO,
    success: true,
    data: response
  };
};
const receiveUserInfoError = (error) => {
  return {
    type: types.RECEIVE_USER_INFO_ERROR,
    success: false,
    error: error
  };
};
export const maybeGetUserInfo = () => {
  return (dispatch, getState) => {
    const auth = getState().auth;
    if ( auth.apiSecret ) {
      return fetch('/api/protected/userinfo', {
          headers: {'X-API-Key': auth.apiSecret}
        })
        .then(res => res.json())
        .then(
          (res) => res.success ? dispatch(receiveUserInfo(res.data)) : dispatch(receiveUserInfoError(res.error)) && dispatch(invalidateLogin()),
          (err) => dispatch(receiveUserInfoError(err)) && dispatch(invalidateLogin())
        );
    } else {
      return Promise.resolve();
    }
  };
};
