import Immutable from "immutable";
import { mergeMap, catchError } from 'rxjs/operators';
import { ofType } from 'redux-observable';
import { firebaseAuth } from '../firebase';
import { of, from } from "rxjs";
import API from '../util/api';
import { push } from 'connected-react-router/immutable';

/***** Actions *****/
export const REQUEST_NEED_ASSIGNMENT = "REQUEST_NEED_ASSIGNMENT";
export const CANCEL_REQUEST_NEED_ASSIGNMENT = "CANCEL_REQUEST_NEED_ASSIGNMENT";

export const SUBMIT_FOR_ASSIGNMENT = "SUBMIT_FOR_ASSIGNMENT";
export const SUBMIT_FOR_ASSIGNMENT_SUCCEEDED = "SUBMIT_FOR_ASSIGNMEN_SUCCEEDEDT";
export const SUBMIT_FOR_ASSIGNMENT_FAILED = "SUBMIT_FOR_ASSIGNMENT_FAILED";

const defaultState = Immutable.Map({
  dialogOpen: false,
  requestedNeed: null,
  state: "", // "", requestingAssignment
});

const moduleRootUIStateKey = ["ui", "taskRequest"];

/***** Reducers *****/
export function reducer(state = defaultState, action) {
  // If the module state hasn't been initialized yet then do that first.
  if (!state.getIn(moduleRootUIStateKey)) {
    state = state.setIn(moduleRootUIStateKey, defaultState);
  }

  switch (action.type) {
    case REQUEST_NEED_ASSIGNMENT:
      return state
        .setIn([...moduleRootUIStateKey, "dialogOpen"], true)
        .setIn([...moduleRootUIStateKey, "status"], "")
        .setIn([...moduleRootUIStateKey, "requestedNeed"], action.need);

    case CANCEL_REQUEST_NEED_ASSIGNMENT:
      return state
        .setIn([...moduleRootUIStateKey, "dialogOpen"], false)
        .setIn([...moduleRootUIStateKey, "status"], "")
        .setIn([...moduleRootUIStateKey, "requestedNeed"], null);

    case SUBMIT_FOR_ASSIGNMENT:
      return state
        .setIn([...moduleRootUIStateKey, "status"], "requestingAssignment");

    default:
      return state;
  }
}

/***** Action Creators *****/
export const requestNeedAssignment = (need) => ({ type: REQUEST_NEED_ASSIGNMENT, need });
export const cancelRequestNeedAssignment = () => ({ type: CANCEL_REQUEST_NEED_ASSIGNMENT });

export const submitForAssignment = (need) => ({ type: SUBMIT_FOR_ASSIGNMENT, need });
const submitForAssignmentSucceeded = () => ({ type: SUBMIT_FOR_ASSIGNMENT_SUCCEEDED });
const submitForAssignmentFailed = () => ({ type: SUBMIT_FOR_ASSIGNMENT_FAILED });

/***** side effects, only as applicable. e.g. thunks, epics, etc *****/
export const submitForAssignmentEpic = action$ =>
  action$.pipe(
    ofType(SUBMIT_FOR_ASSIGNMENT),
    mergeMap(action => {
      return API.getAuthenticatedJSONRequestObservable("/needs/assign", "post", {id: action.need.id}).pipe(
        mergeMap(resp => {
          console.log(resp);
          return [submitForAssignmentSucceeded()];
        }),
        catchError(err => {
          return [submitForAssignmentFailed(err)];
        })
      )
    })
  );
