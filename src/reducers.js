import Immutable from 'immutable';
import { combineReducers } from 'redux-immutable';
import { reducer as userReducer, USER_LOGOUT } from 'modules/user';
// import Cookies from 'js-cookie';

const rootReducer = (state, action) => {
  if (action.type === USER_LOGOUT) {
    // Cookies.remove("abc");
    state = Immutable.Map();
  }
  
  // TODO: Change this into a loop.
  state = myReducer(state, action);
  return state;
};

export default rootReducer;