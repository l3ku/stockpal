import { REQUEST_USER_STOCKS } from '../actions/types';
import API from '../utils/api';

const initialState = {
  items: [],
  success: null,
  isLoaded: false,
  errors: null
};

export default function(state=initialState, action) {
  switch ( action.type ) {
    case REQUEST_USER_STOCKS:
      // Don't refetch items if they have already been previously loaded succesfully...
      if ( state.success && state.items.length > 0 ) {
        return state;
      } else {
        var newState = { ...state };
        API.getUserStocks(
          action.apiID,
          action.apiSecret,
          (result) => {
            newState.success = result.success;
            newState.payload = result.data;
            newState.error = null;
          },
          (error) => {
            newState.success = false;
            newState.payload = [];
            newState.error = error;
          }
        );
        return newState;
      }
    default:
      return state;
  }
};