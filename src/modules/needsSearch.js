import Immutable from "immutable";
import { mergeMap, map, catchError } from 'rxjs/operators';
import { ofType } from 'redux-observable';
import API from '../util/api';
import moment from 'moment';

/***** Actions *****/
export const LOAD_SEARCH_RESULTS = "LOAD_SEARCH_RESULTS";
export const LOAD_SEARCH_RESULTS_SUCCEEDED = "LOAD_SEARCH_RESULTS_SUCCEEDED";
export const LOAD_SEARCH_RESULTS_FAILED = "LOAD_SEARCH_RESULTS_FAILED";

const defaultState = Immutable.Map({
  state: "",   // "loading", "failed", ""
  error: null, // an object with error info.
  results: null, // null when no query, or Immutable set.
  message: "", // null when no query, or Immutable set.
});

const moduleRootUIStateKey = ["ui", "search"];

/***** Reducers *****/
export function reducer(state = defaultState, action) {
  // If the module state hasn't been initialized yet then do that first.
  if (!state.getIn(moduleRootUIStateKey)) {
    state = state.setIn(moduleRootUIStateKey, defaultState);
  }

  switch (action.type) {
    case LOAD_SEARCH_RESULTS:
      return state
        .setIn([...moduleRootUIStateKey, "state"], "loading")
        .setIn([...moduleRootUIStateKey, "error"], null)
        .setIn([...moduleRootUIStateKey, "message"], "")
        .setIn([...moduleRootUIStateKey, "results"], null)
        // .setIn(["entities", "needs"], null);

    case LOAD_SEARCH_RESULTS_SUCCEEDED:
      return state
        .setIn([...moduleRootUIStateKey, "state"], "")
        .setIn([...moduleRootUIStateKey, "error"], null)
        .setIn([...moduleRootUIStateKey, "message"], action.response.message)
        .setIn([...moduleRootUIStateKey, "results"], action.response.results);

    case LOAD_SEARCH_RESULTS_FAILED:
      return state
        .setIn([...moduleRootUIStateKey, "state"], "failed")
        .setIn([...moduleRootUIStateKey, "message"], "")
        .setIn([...moduleRootUIStateKey, "error"], action.error)
        .setIn([...moduleRootUIStateKey, "results"], null);

    default:
      return state;
  }
}

/***** Action Creators *****/
export const loadSearchResults = (filter) => ({ type: LOAD_SEARCH_RESULTS, filter });
export const loadSearchResultsFailed = (error) => ({ type: LOAD_SEARCH_RESULTS_FAILED, error });
export const loadSearchResultsSucceeded = (response) => ({ type: LOAD_SEARCH_RESULTS_SUCCEEDED, response });


/***** side effects, only as applicable. e.g. thunks, epics, etc *****/
export const loadSearchEpic = action$ =>
  action$.pipe(
    ofType(LOAD_SEARCH_RESULTS),
    mergeMap(action => {
      const { lat, lng, distance, units } = action.filter;
      const searchUrl = `/needs?lat=${lat}&lng=${lng}&distance=${distance}&units=${units}`
      return API.getAuthenticatedJSONRequestObservable(searchUrl, "get").pipe(
        map(resp => {
          let results = resp.response.results;
          // Convert the dates to moment dates.
          results = results.map(result => {
            result.createdAt = moment(result.createdAt._seconds * 1000);
            return result;
          })

          // console.log(resp);
          return loadSearchResultsSucceeded({results: results, message: resp.response.message});
        }),
        catchError(err => {
          alert(`Unexpected error: ${err}`);
          console.error(err);
          // TODO: What to return here?
          return [];
        })
      )
    })
  );
