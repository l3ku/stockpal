import * as types from './types';

export const requestUserInfo = () => {
  return {
    type: types.REQUEST_USER_INFO
  };
};
export const receiveUserInfo = (response) => {
  return {
    type: types.RECEIVE_USER_INFO,
    success: response.success,
    data: response.data
  };
};
export const receiveUserInfoError = (error) => {
  return {
    type: types.RECEIVE_USER_INFO_ERROR,
    success: false,
    error: error
  };
};
export const maybeGetUserInfo = () => {
  return (dispatch, getState) => {
    const auth = getState().auth;
    if ( auth.apiID && auth.apiSecret ) {
      return fetch('/api/protected/userinfo/' + encodeURIComponent(auth.apiID), {
          headers: {'X-API-Key': auth.apiSecret}
        })
        .then(res => res.json())
        .then(
          (res) => dispatch(receiveUserInfo(res)),
          (err) => dispatch(receiveUserInfoError(err))
        );
    } else {
      return Promise.resolve();
    }
  };
};
