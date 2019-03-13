import {
  REQUEST_USER_STOCKS,
  RECEIVE_USER_STOCKS,
  RECEIVE_USER_STOCKS_ERROR,
  REQUEST_ADD_USER_STOCK,
  RECEIVE_ADD_USER_STOCK,
  RECEIVE_ADD_USER_STOCK_ERROR,
  REQUEST_DELETE_USER_STOCK,
  RECEIVE_DELETE_USER_STOCK,
  RECEIVE_DELETE_USER_STOCK_ERROR,
  CHANGE_USER_STOCKS_PAGE,
  CHANGE_USER_STOCKS_PER_PAGE
} from '../actions/types';
import API from '../utils/api';

const initialState = {
  items: [],
  success: null,
  isLoaded: false,
  symbol: null,
  error: null,
  itemsPerPage: 50,
  showPageRange: 10,
  totalPages: 1,
  currentPage: 1
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
    case CHANGE_USER_STOCKS_PAGE:
      if ( action.page !== state.currentPage && action.page <= state.totalPages ) {
        return {
          ...state,
          currentPage: action.page
        };
      } else {
        return state;
      }
    case CHANGE_USER_STOCKS_PER_PAGE:
      if ( action.itemsPerPage !== state.itemsPerPage ) {
        // We need to ensure that if the maximum number of pages changes, we need to go back to
        // to the last page if we are above the limit. E.g. on last page when 50 items/page, and
        // changes to 300/page => out of range on pages.
        var currentPage = state.currentPage;
        const newTotalPages = Math.ceil(state.items.length / action.itemsPerPage);
        if ( currentPage > newTotalPages ) {
          currentPage = newTotalPages;
        }
        return {
          ...state,
          itemsPerPage: action.itemsPerPage,
          totalPages: newTotalPages,
          currentPage: currentPage
        };
      } else {
        return state;
      }
    default:
      return state;
  }
};





