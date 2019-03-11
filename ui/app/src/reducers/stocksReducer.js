import {
  REQUEST_STOCKS,
  RECEIVE_STOCKS,
  RECEIVE_STOCKS_ERROR
} from '../actions/types';

const initialState = {
  items: [],
  success: null,
  isLoaded: false,
  errors: null
};

export default function(state=initialState, action) {
  switch ( action.type ) {
    case RECEIVE_STOCKS:
      return {
        ...state,
        success: true,
        error: null,
        items: action.items,
        isLoaded: true
      };
    default:
      return state;
  }
};
