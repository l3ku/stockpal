import * as types from './types';
import API from '../utils/api';

// General actions common for all stock types
export const requestStocks = (type=types.REQUEST_STOCKS) => {
  return {
    type: type
  };
};
export const receiveStocks = (response, type=types.RECEIVE_STOCKS) => {
  return {
    type: type,
    success: response.success,
    items: response.data,
    receivedAt: Date.now()
  };
};
export const receiveStocksError = (error, type=types.RECEIVE_STOCKS_ERROR) => {
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
        (res) => dispatch(receiveStocks(res)),
        (err) => dispatch(receiveStocksError(err))
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
        (res) => dispatch(receiveStocks(res, types.RECEIVE_GAINER_STOCKS)),
        (err) => dispatch(receiveStocksError(err, types.RECEIVE_GAINER_STOCKS_ERROR))
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
  return dispatch => {
    dispatch(requestStocks(types.REQUEST_GAINER_STOCKS));
    return fetch('/api/v1/gainers')
      .then(res => res.json())
      .then(
        (res) => dispatch(receiveStocks(res, types.RECEIVE_USER_STOCKS)),
        (err) => dispatch(receiveStocksError(err, types.RECEIVE_USER_STOCKS_ERROR))
      );
  };
};
export const fetchUserStocks = () => {
  return (dispatch, getState) => {
    const userStocks = getState().userStocks;
    if ( !userStocks.isLoaded && (userStocks.items === undefined || userStocks.items.length === 0) ) {
      return dispatch(fetchUserStocksFromAPI());
    }
    return Promise.resolve();
  }
}
