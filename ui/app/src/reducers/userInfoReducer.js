import {
  REQUEST_USER_INFO,
  RECEIVE_USER_INFO,
  RECEIVE_USER_INFO_ERROR
} from '../actions/types';
import user_avatar_placeholder from '../user-avatar-placeholder.png';

const initialState = {
  userPicture: user_avatar_placeholder,
  userName: 'Loading...'
};

export default function(state=initialState, action) {
  switch ( action.type ) {
    case RECEIVE_USER_INFO:
      return {
        ...state,
        success: action.success,
        error: null,
        userName: action.data.user_name,
        userPicture: action.data.user_picture_url,
        userEmail: action.data.user_email,
        isLoaded: true
      };
    default:
      return state;
  }
}