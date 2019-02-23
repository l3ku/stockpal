import { FETCH_ALL_STOCKS } from '../actions/types';

const initialState = {
  items: [],
  success: null,
  isLoaded: false
};

export default function(state=initialState, action) {
  switch ( action.type ) {
    case FETCH_ALL_STOCKS:
      return {
        ...state,
        items: action.payload,
        success: action.success,
        isLoaded: true
      };
    default:
      return state;
  }
};
