import {
  REQUEST_GAINER_STOCKS,
  RECEIVE_GAINER_STOCKS,
  RECEIVE_GAINER_STOCKS_ERROR
} from '../actions/types';

const initialState = {
  items: [],
  success: null,
  isLoaded: false,
  error: null
};

export default function(state=initialState, action) {
  switch ( action.type ) {
    case RECEIVE_GAINER_STOCKS:
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