import { combineReducers } from 'redux';
import authReducer from './authReducer';
import userInfoReducer from './userInfoReducer';
import tableReducer from './tableReducer';


export default combineReducers({
  auth: authReducer,
  user: userInfoReducer,
  table: tableReducer
});
