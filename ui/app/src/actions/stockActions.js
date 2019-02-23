import { FETCH_ALL_STOCKS } from './types';
import API from '../utils/api';

export const fetchAllStocks = () => dispatch => {
  API.getStockInfo('',
    (result) => dispatch({
      type: FETCH_ALL_STOCKS,
      success: result.success,
      payload: result.data
    })
  );
}
