import { compose, createStore, applyMiddleware } from "redux";
import { createEpicMiddleware } from "redux-observable";
import { rootEpic } from "./epics";
import Immutable from "immutable";
import { routerMiddleware } from 'connected-react-router/immutable';
import createRootReducer from './reducers';
import { createBrowserHistory } from 'history';

const epicMiddleware = createEpicMiddleware();
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
export const history = createBrowserHistory();

/*
 * Notes about the state structure. Stick to the entities/ui store structure as described in
 * the redux documentation at
 * https://redux.js.org/recipes/structuringreducers/basicreducerstructure.
 *
 * Initialization for the specific screens and functionality is left to the specific reducers.
 */
const initialState = Immutable.Map({
  environment: Immutable.Map(),
  user: Immutable.Map(),
  entities: Immutable.Map(),
  ui: Immutable.Map()
});

export default function configureStore() {
  const store = createStore(
    createRootReducer(history),
    initialState,
    composeEnhancers(
      applyMiddleware(
        routerMiddleware(history),
        epicMiddleware
      )
    )
  );

  epicMiddleware.run(rootEpic);
  return store;
}
