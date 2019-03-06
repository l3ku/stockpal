import { combineReducers } from 'redux';
import authReducer from './authReducer';
import stocksReducer from './stocksReducer';
import userStocksReducer from './userStocksReducer';
import gainerStocksReducer from './gainerStocksReducer';


export default combineReducers({
  auth: authReducer,
  stocks: stocksReducer,
  userStocks: userStocksReducer,
  gainerStocks: gainerStocksReducer
});
