import { combineReducers } from 'redux';
import authReducer from './authReducer';
import stocksReducer from './stocksReducer';
import userStocksReducer from './userStocksReducer';
import gainerStocksReducer from './gainerStocksReducer';
import userInfoReducer from './userInfoReducer';


export default combineReducers({
  auth: authReducer,
  stocks: stocksReducer,
  userStocks: userStocksReducer,
  gainerStocks: gainerStocksReducer,
  user: userInfoReducer
});
