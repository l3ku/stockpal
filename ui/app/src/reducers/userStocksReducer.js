import {
  REQUEST_USER_STOCKS,
  RECEIVE_USER_STOCKS,
  RECEIVE_USER_STOCKS_ERROR,
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
    default:
      return state;
  }
};