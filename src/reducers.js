import Immutable from 'immutable';
import { reducer as userReducer, CLEAR_SESSION } from './modules/auth';
import { reducer as environmentReducer } from './modules/environment';

const rootReducer = (state, action) => {
  if (action.type === CLEAR_SESSION) {
    window.location = "/";
    // state = Immutable.Map();
  }
  
  // TODO: Change this into a loop.
  state = environmentReducer(state, action);
  state = userReducer(state, action);
  return state;
};

export default rootReducer;