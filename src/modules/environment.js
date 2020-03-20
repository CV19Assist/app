import Immutable from 'immutable';

/***** Actions *****/
const ENVIRONMENT_GET_INFO   = 'ENVIRONMENT_GET_INFO';
const ENVIRONMENT_GET_INFO_SUCCEEDED   = 'ENVIRONMENT_GET_INFO_SUCCEEDED';
const ENVIRONMENT_GET_INFO_FAILED   = 'ENVIRONMENT_GET_INFO_FAILED';

const defaultState = Immutable.Map({
  failure: Immutable.Map(),
  state: "",         // "", loading, failed, loaded
  abbreviation: "",  // Abbreviation of the environment: local-dev, dev, stage, prod
});

const moduleDomainRoot = ["user"];

/***** Reducers *****/
export function reducer(state = defaultState, action) {
  // If the module state hasn't been initialized yet then do that first.
  if (!state.getIn(moduleDomainRoot)) {
    state = state.setIn(moduleDomainRoot, defaultState);
  }

  switch (action.type) {
    case ENVIRONMENT_GET_INFO:
        return state
            .setIn(["environment", "state"], "loaded")
            .setIn(["environment", "abbreviation"], "dev")
            .setIn(["environment", "failure"], Immutable.Map());

    // case ENVIRONMENT_GET_INFO_FAILED:
    //   return state.set("state", "failed")
    //     .set("failure", Immutable.fromJS(action.message));

    // case ENVIRONMENT_GET_INFO_SUCCEEDED:
    //   return state.set("state", "loaded")
    //     .set("name", action.name)
    //     .set("abbreviation", action.abbreviation)
    //     .set("failure", Immutable.Map());

    default:
      return state;
  }
}

/***** Action Creators *****/
export const getEnvironmentInfo = () => ({ type: ENVIRONMENT_GET_INFO });
export const getEnvironmentInfoSucceeded = (payload) => ({type: ENVIRONMENT_GET_INFO_SUCCEEDED, ...payload});
export const getEnvironmentInfoFailed = (errorMessage) => ({type: ENVIRONMENT_GET_INFO_FAILED, message: errorMessage});


/***** side effects, only as applicable. e.g. thunks, epics, etc *****/

// // Load the list of versions once the token is accepted.
// export const loadEnvironmentInfoEpic = action$ =>
//   action$.ofType(ENVIRONMENT_GET_INFO)
//     .mergeMap(action => {
//       return ajax.get(
//         HealthDecisionAPI.API_ROOT + "/env"
//       )
//         .map(data => {
//           return getEnvironmentInfoSucceeded(data.response);
//         })
//         .catch(xhr => {
//           return Observable.of(getEnvironmentInfoFailed(xhr.message));
//         })
//     });