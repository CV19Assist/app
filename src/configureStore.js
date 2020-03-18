import { compose, createStore, applyMiddleware } from "redux";
import { createEpicMiddleware } from "redux-observable";
import rootReducer from "./reducers";
import { rootEpic } from "./epics";
import Immutable from "immutable";

const epicMiddleware = createEpicMiddleware();
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

/*
 * Notes about the state structure. Helios tries to stick to the entities/ui store structure as
 * briefly described in the redux documentation at
 * https://redux.js.org/recipes/structuringreducers/basicreducerstructure.
 *
 * Initialization on the specific screens and functionality is left to the specific reducers.
 */
const initialState = Immutable.Map({
  environment: Immutable.Map(),
  user: Immutable.Map(),
  entities: Immutable.Map(),
  ui: Immutable.Map()
});

export default function configureStore() {
  const store = createStore(
    rootReducer,
    initialState,
    composeEnhancers(applyMiddleware(epicMiddleware))
  );

  epicMiddleware.run(rootEpic);

  return store;
}
