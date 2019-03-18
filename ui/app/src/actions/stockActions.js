import * as types from './types';
import {
  requestItems,
  receiveItems,
  requestItemsError,
  receiveItemsError,
  requestActionOnItems,
  receiveActionOnItems,
  requestActionOnItemsError,
  receiveActionOnItemsError
} from './tableActions';

export const fetchStocks = () => {
  const namespace = 'ALL_STOCKS';
  return (dispatch, getState) => {
    const stocks = getState().table[namespace].content;
    if ( !stocks.isLoaded && (stocks.items === undefined || stocks.items.length === 0) ) {
      dispatch(requestItems(namespace));
      return fetch('/api/v1/stock')
        .then(res => res.json())
        .then(
          (res) => res.success ? dispatch(receiveItems(res.data, namespace)) : dispatch(receiveItemsError(res.error, namespace)),
          (err) => dispatch(receiveItemsError(err, namespace))
        );
    }
    return Promise.resolve();
  };
}

export const fetchGainerStocks = () => {
  const namespace = 'GAINER_STOCKS';
  return (dispatch, getState) => {
    const gainerStocks = getState().table[namespace].content;
    if ( !gainerStocks.isLoaded && (gainerStocks.items === undefined || gainerStocks.items.length === 0) ) {
      dispatch(requestItems(namespace));
      return fetch('/api/v1/gainers')
        .then(res => res.json())
        .then(
          (res) => res.success ? dispatch(receiveItems(res.data, namespace)) : dispatch(receiveItemsError(res.error, namespace)),
          (err) => dispatch(receiveItemsError(err, namespace))
        );
    }
    return Promise.resolve();
  }
}

export const fetchUserStocks = () => {
  const namespace = 'USER_STOCKS';
  return (dispatch, getState) => {
    const userStocks = getState().table[namespace].content;

    // Don't make external API requests if there is no need to (data already present)
    if ( !userStocks.isLoaded || userStocks.items === undefined || userStocks.items.length === 0 ) {
      const auth = getState().auth;
      dispatch(requestItems(namespace));
      if ( auth.isLoggedIn ) {
        return fetch('/api/protected/stocks/' + encodeURIComponent(auth.apiID), {
            headers: {
              'X-API-Key': auth.apiSecret
            },
          })
          .then(res => res.json())
          .then(
            (res) => res.success ? dispatch(receiveItems(res.data, namespace)) : dispatch(receiveItemsError(res.error, namespace)),
            (err) => dispatch(receiveItemsError(err, namespace))
          );
      } else {
        return dispatch(requestItemsError('User not logged in', namespace));
      }
    }
    return Promise.resolve();
  }
}


export const addUserStocks = (symbols) => {
  const namespace = 'USER_STOCKS';
  const action = 'add';
  return (dispatch, getState) => {
    dispatch(requestActionOnItems(action, namespace));
    const userStocks = getState().table[namespace].content;
    const auth = getState().auth;

    // Don't attempt to do anything if the user is not currently logged in
    if ( !auth.isLoggedIn ) {
      return dispatch(requestActionOnItemsError('User is not logged in', action, namespace));
    }

    return fetch('/api/protected/stocks/' + encodeURIComponent(auth.apiID), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'X-API-Key': auth.apiSecret
      },
      body: JSON.stringify({
        'stock_symbols': symbols
      })
    })
    .then(res => res.json())
    .then(
      (res) => res.success ? dispatch(receiveActionOnItems(symbols, action, namespace)) : dispatch(receiveActionOnItemsError(res.error, action, namespace)),
      (err) => dispatch(receiveActionOnItemsError(err, action, namespace))
    );
  }
}

export const deleteUserStock = (symbol) => {
  const namespace = 'USER_STOCKS';
  const action = 'delete';
  return (dispatch, getState) => {
    dispatch(requestActionOnItems(action, namespace));
    const userStocks = getState().table[namespace].content;
    const auth = getState().auth;

    // Don't attempt to do anything if the user is not currently logged in
    if ( !auth.isLoggedIn ) {
      return dispatch(requestActionOnItemsError('User is not logged in', action, namespace));
    }

    return fetch('/api/protected/stocks/' + encodeURIComponent(auth.apiID), {
        method: 'DELETE',
        headers: {
          'content-type': 'application/json',
          'X-API-Key': auth.apiSecret
        },
        body: JSON.stringify({
          'stock_symbol': symbol
        })
      })
      .then(res => res.json())
      .then(
        (res) => res.success ? dispatch(receiveActionOnItems(symbol, action, namespace)) : dispatch(receiveActionOnItemsError(res.error, action, namespace)),
        (err) => dispatch(receiveActionOnItemsError(err, action, namespace))
      );
  };
};

