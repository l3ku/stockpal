import {
  REQUEST_USER_STOCKS,
  RECEIVE_USER_STOCKS,
  RECEIVE_USER_STOCKS_ERROR,
  REQUEST_ADD_USER_STOCK,
  RECEIVE_ADD_USER_STOCK,
  RECEIVE_ADD_USER_STOCK_ERROR,
  REQUEST_DELETE_USER_STOCK,
  RECEIVE_DELETE_USER_STOCK,
  RECEIVE_DELETE_USER_STOCK_ERROR
} from '../actions/types';
import API from '../utils/api';

const initialState = {
  items: [],
  success: null,
  isLoaded: false,
  error: null,
  symbol: null
};

export default function(state=initialState, action) {
  switch ( action.type ) {
    case RECEIVE_USER_STOCKS:
      return {
        ...state,
        success: true,
        items: action.items,
        isLoaded: true
      };
    case RECEIVE_ADD_USER_STOCK:
      return {
        ...state,
        success: true,
        symbol: action.symbol
      };
    case RECEIVE_DELETE_USER_STOCK:
      return {
        ...state,
        success: true,
        items: state.items.filter(obj => obj.symbol !== action.symbol),
        symbol: action.symbol
      };
    default:
      return state;
  }
};