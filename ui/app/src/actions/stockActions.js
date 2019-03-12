import * as types from './types';
import API from '../utils/api';

// General actions common for all stock types
const requestStocks = (type=types.REQUEST_STOCKS) => {
  return {
    type: type
  };
};
const receiveStocks = (data, type=types.RECEIVE_STOCKS) => {
  return {
    type: type,
    items: data,
    receivedAt: Date.now()
  };
};
const stockActionError = (error, type=types.RECEIVE_STOCKS_ERROR) => {
  return {
    type: type,
    error: error
  };
};

// Actions for stocks
const fetchStocksFromAPI = () => {
  return dispatch => {
    dispatch(requestStocks());
    return fetch('/api/v1/stock')
      .then(res => res.json())
      .then(
        (res) => res.success ? dispatch(receiveStocks(res.data)) : dispatch(stockActionError(res.error)),
        (err) => dispatch(stockActionError(err))
      );
  };
};
export const fetchStocks = () => {
  return (dispatch, getState) => {
    const stocks = getState().stocks;
    if ( !stocks.isLoaded && (stocks.items === undefined || stocks.items.length === 0) ) {
      return dispatch(fetchStocksFromAPI());
    }
    return Promise.resolve();
  };
}

// Actions for Gainer stocks ("gainers")
const fetchGainerStocksFromAPI = () => {
  return dispatch => {
    dispatch(requestStocks(types.REQUEST_GAINER_STOCKS));
    return fetch('/api/v1/gainers')
      .then(res => res.json())
      .then(
        (res) => res.success ? dispatch(receiveStocks(res.data, types.RECEIVE_GAINER_STOCKS)) : dispatch(stockActionError(res.error, types.RECEIVE_GAINER_STOCKS_ERROR)),
        (err) => dispatch(stockActionError(err, types.RECEIVE_GAINER_STOCKS_ERROR))
      );
  };
};
export const fetchGainerStocks = () => {
  return (dispatch, getState) => {
    const gainerStocks = getState().gainerStocks;
    if ( !gainerStocks.isLoaded && (gainerStocks.items === undefined || gainerStocks.items.length === 0) ) {
      return dispatch(fetchGainerStocksFromAPI());
    }
    return Promise.resolve();
  }
}


// Actions for the stocks of users
const fetchUserStocksFromAPI = () => {
  return (dispatch, getState) => {
    const auth = getState().auth;
    const userStocks = getState().userStocks;
    dispatch(requestStocks(types.REQUEST_USER_STOCKS));
    if ( auth.isLoggedIn ) {

      return fetch('/api/protected/stocks/' + encodeURIComponent(auth.apiID), {
          headers: {
            'X-API-Key': auth.apiSecret
          },
        })
        .then(res => res.json())
        .then(
          (res) => res.success ? dispatch(receiveStocks(res.data, types.RECEIVE_USER_STOCKS)) : dispatch(stockActionError(res.error, types.RECEIVE_USER_STOCKS_ERROR)),
          (err) => dispatch(stockActionError(err, types.RECEIVE_USER_STOCKS_ERROR))
        );
    } else {
      return dispatch(stockActionError('User not logged in', types.RECEIVE_USER_STOCKS_ERROR));
    }

  };
};
export const fetchUserStocks = () => {
  return (dispatch, getState) => {
    const userStocks = getState().userStocks;
    // Don't make external API requests if there is no need to (data already present)
    if ( !userStocks.isLoaded || userStocks.items === undefined || userStocks.items.length === 0 ) {
      return dispatch(fetchUserStocksFromAPI());
    } else {
      return dispatch(receiveStocks(userStocks.items, types.RECEIVE_USER_STOCKS))
    }
    return Promise.resolve();
  }
}


export const addUserStock = (symbol) => {
  return (dispatch, getState) => {
    const userStocks = getState().userStocks;
    const auth = getState().auth;

    // Don't make unnecessary API requests if the stock already exists
    if ( userStocks.length > 0 && userStocks.find(val => val.symbol === symbol) !== undefined ) {
      return dispatch(stockActionError('Stock already exists in user stocks', types.RECEIVE_ADD_USER_STOCK_ERROR));
    }

    // Don't attempt to do anything if the user is not currently logged in
    if ( !auth.isLoggedIn ) {
      return dispatch(stockActionError('User is not logged in', types.RECEIVE_ADD_USER_STOCK_ERROR));
    }

    return fetch('/api/protected/stocks/' + encodeURIComponent(auth.apiID), {
      method: 'POST',
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
      (res) => res.success ? dispatch({ 'type': types.RECEIVE_ADD_USER_STOCK, 'symbol': symbol }) : dispatch(stockActionError(res.error, types.RECEIVE_ADD_USER_STOCK_ERROR)),
      (err) => dispatch(stockActionError(err, types.RECEIVE_ADD_USER_STOCK_ERROR))
    );
  }
}

export const deleteUserStock = (symbol) => {
  return (dispatch, getState) => {
    const userStocks = getState().userStocks;
    const auth = getState().auth;

    // Don't attempt to do anything if the user is not currently logged in
    if ( !auth.isLoggedIn ) {
      return dispatch(stockActionError('User is not logged in', types.RECEIVE_USER_STOCKS_ERROR));
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
        (res) => res.success ? dispatch({ 'type': types.RECEIVE_DELETE_USER_STOCK, 'symbol': symbol }) : dispatch(stockActionError(res.error, types.RECEIVE_DELETE_USER_STOCK_ERROR)),
        (err) => dispatch(stockActionError(err, types.RECEIVE_DELETE_USER_STOCK_ERROR))
      );
  };
};

export const changeStocksPage = (page) => {
  return dispatch => {
    return dispatch({ 'type': types.CHANGE_STOCKS_PAGE, 'page': page });
  };
}
export const changeStocksPerPage = (stocksPerPage) => {
  return dispatch => {
    return dispatch({ 'type': types.CHANGE_STOCKS_PER_PAGE, 'itemsPerPage': stocksPerPage });
  };
};
