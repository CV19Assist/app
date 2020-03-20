import { reducer as userReducer } from './modules/user';
import { reducer as environmentReducer } from './modules/environment';
import { connectRouter } from 'connected-react-router/immutable';
import { combineReducers } from "redux-immutable";
import Immutable from "immutable";

const createRootReducer = history => {
  const oldSlicedReducers = combineReducers({
    router: connectRouter(history),

    environment: (state = Immutable.Map()) => state,
    user: (state = Immutable.Map()) => state,

    // combineReducers expects same state shape every time so force simple functions.
    entities: (state = Immutable.Map()) => state,
    ui: (state = Immutable.Map()) => state
  });

  const rootReducer = (state, action) => {
    // TODO: Change this into a loop.
    state = environmentReducer(state, action);
    state = userReducer(state, action);
    state = oldSlicedReducers(state, action);
    return state;
  };

  return rootReducer;
};

export default createRootReducer;