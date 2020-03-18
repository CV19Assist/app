import Immutable from "immutable";
import { ajax } from "rxjs/ajax";
import { map, mergeMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ofType } from 'redux-observable';
// import Cookies from "js-cookie";
// import { toast } from "react-toastify";

/***** Actions *****/
export const USER_LOGIN = "USER_LOGIN";
const USER_LOGIN_FAILED = "USER_LOGIN_FAILED";
export const USER_LOGIN_SUCCEEDED = "USER_LOGIN_SUCCEEDED";

// This is a special case that's dealt in reducers/index so we export it.
export const USER_LOGOUT = "USER_LOGOUT";


const defaultState = Immutable.Map({
  isAuthenticated: false,
  loginFailure: Immutable.Map(),
  state: "", // "", loggingIn, loginFailed, loginSuccessful
});

/***** Reducers *****/
export function reducer(state = defaultState, action) {
  switch (action.type) {
    case USER_LOGIN:
      return state
        .set("state", "loggingIn")
        .set("isAuthenticated", false)
        .set("loginFailure", Immutable.Map());

    case USER_LOGIN_FAILED:
      return state
        .set("state", "loginFailed")
        .set("isAuthenticated", false)
        .set("loginFailure", Immutable.fromJS(action.message));

    case USER_LOGIN_SUCCEEDED:
      return state
        .set("state", "loginSuccessful")
        .set("isAuthenticated", true)
        .set("firstName", action.payload.firstName)
        .set("id", action.payload.id)
        .set("lastName", action.payload.lastName)
        .set("email", action.payload.emailAddress)
        .set("loginFailure", Immutable.Map());

    default:
      return state;
  }
}

/***** Action Creators *****/
export const login = (username, password) => ({ type: USER_LOGIN, username, password });
export const loginSucceeded = payload => ({ type: USER_LOGIN_SUCCEEDED, payload });
export const loginFailed = errorMessage => ({ type: USER_LOGIN_FAILED, message: errorMessage });
export const logout = () => ({ type: USER_LOGOUT });

export const loadExistingSession = () => ({ type: USER_LOAD_EXISTING_SESSION });
export const existingSessionChecked = () => ({ type: USER_EXISTING_SESSION_CHECKED });

export const changePassword = (oldPassword, newPassword) => ({type: USER_CHANGE_PASSWORD, oldPassword, newPassword});
export const changePasswordSucceeded = payload => ({type: USER_CHANGE_PASSWORD_SUCCEEDED, payload});
export const changePasswordFailed = errorMessage => ({type: USER_CHANGE_PASSWORD_FAILED, errorMessage});

/***** side effects, only as applicable. e.g. thunks, epics, etc *****/
// Load the list of versions once the token is accepted.
export const loginEpic = action$ =>
  action$.pipe(
    ofType(USER_LOGIN),
    mergeMap(action => {
      return ajax
        .post(
        )
    })
  );

// Load existing session
export const loadExistingSessionEpic = (action$, store) =>
  action$.pipe(
    ofType(USER_LOAD_EXISTING_SESSION),
    mergeMap(action => {
    })
  );