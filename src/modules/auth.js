import Immutable from "immutable";
import { mergeMap, catchError, map } from 'rxjs/operators';
import { ofType } from 'redux-observable';
// import { toast } from "react-toastify";
import { firebaseAuth, db } from '../firebase';
import { of, from } from "rxjs";

/***** Actions *****/
export const INITIALIZE_USER_AUTH = "INITIALIZE_USER_AUTH";
export const USER_LOGIN = "USER_LOGIN";
const USER_LOGIN_FAILED = "USER_LOGIN_FAILED";
export const USER_LOGIN_SUCCEEDED = "USER_LOGIN_SUCCEEDED";
export const USER_ALREADY_LOGGED_IN = "USER_ALREADY_LOGGED_IN";
export const USER_NOT_ALREADY_LOGGED_IN = "USER_NOT_ALREADY_LOGGED_IN";
export const USER_LOGGED_IN = "USER_LOGGED_IN";
export const CLEAR_SESSION = "CLEAR_SESSION"

// This is a special case that's dealt in reducers/index so we export it.
export const USER_LOGOUT = "USER_LOGOUT";

const defaultState = Immutable.Map({
  isAuthenticated: false,
  currentUser: null,
  state: "", // "", checking, loggingIn, loginFailed, loginSuccessful
});

const moduleDomainRoot = ["user"];

/***** Reducers *****/
export function reducer(state = defaultState, action) {
  switch (action.type) {
    case INITIALIZE_USER_AUTH:
      return state
        .setIn([...moduleDomainRoot, "state"], "checking")
        .setIn([...moduleDomainRoot, "currentUser"], null)
        .setIn([...moduleDomainRoot, "isAuthenticated"], false);

    case USER_LOGGED_IN:
      return state
        .setIn([...moduleDomainRoot, "state"], "loggedIn")
        .setIn([...moduleDomainRoot, "currentUser"], action.user)
        .setIn([...moduleDomainRoot, "isAuthenticated"], true);

    // case USER_ALREADY_LOGGED_IN:
    //   return state
    //     .setIn([...moduleDomainRoot, "state"], "loggedIn")
    //     .setIn([...moduleDomainRoot, "currentUser"], action.user)
    //     .setIn([...moduleDomainRoot, "isAuthenticated"], true);

    case USER_NOT_ALREADY_LOGGED_IN:
      return state
        .setIn([...moduleDomainRoot, "state"], "")
        .setIn([...moduleDomainRoot, "isAuthenticated"], false);

    // case USER_LOGIN:
    //   // return state
    //   //   .setIn(["state", "loggingIn")
    //   //   .setIn(["isAuthenticated", false)

    // case USER_LOGIN_FAILED:
    //   return state
    //     .set("state", "loginFailed")
    //     .set("isAuthenticated", false)
    //     .set("loginFailure", Immutable.fromJS(action.message));

    // case USER_LOGIN_SUCCEEDED:
    //   return state
    //     .set("state", "loginSuccessful")
    //     .set("isAuthenticated", true)
    //     .set("firstName", action.payload.firstName)
    //     .set("id", action.payload.id)
    //     .set("lastName", action.payload.lastName)
    //     .set("email", action.payload.emailAddress)
    //     .set("loginFailure", Immutable.Map());

    default:
      return state;
  }
}

/***** Action Creators *****/
export const initializeUserAuth = () => ({ type: INITIALIZE_USER_AUTH });
export const login = (username, password) => ({ type: USER_LOGIN, username, password });
export const loginSucceeded = payload => ({ type: USER_LOGIN_SUCCEEDED, payload });
export const loginFailed = errorMessage => ({ type: USER_LOGIN_FAILED, message: errorMessage });
export const logout = () => ({ type: USER_LOGOUT });
// export const userAlreadyLoggedIn = (user) => ({ type: USER_ALREADY_LOGGED_IN, user });
export const userNotAlreadyLoggedIn = () => ({ type: USER_NOT_ALREADY_LOGGED_IN });
export const clearSession = () => ({ type: CLEAR_SESSION });
export const userLoggedIn = (user) => ({ type: USER_LOGGED_IN, user });

/***** side effects, only as applicable. e.g. thunks, epics, etc *****/
export const userCheckEpic = action$ =>
  action$.pipe(
    ofType(INITIALIZE_USER_AUTH),
    mergeMap(() => {
      let user = firebaseAuth.currentUser;
      if (user) {
        return of(userLoggedIn(user));
        // return of(userAlreadyLoggedIn(user));
      } else {
        return of(userNotAlreadyLoggedIn());
      }
    })
    // mergeMap(async () => {
    //   let user = firebaseAuth.currentUser;
    //   if (user) {
    //     await db.collection("users").doc(user.uid).get().then(doc => {
    //       if (doc.exists) {
    //         console.log("Doc exists.")
    //       } else {
    //         console.log("Doc doens't exist.")
    //       }
    //       return of(userLoggedIn(user));
    //     });

    //     return of(userLoggedIn(user));
    //     // return of(userAlreadyLoggedIn(user));
    //   } else {
    //     return of(userNotAlreadyLoggedIn());
    //   }
    // })
  );

export const logoutEpic = action$ =>
  action$.pipe(
    ofType(USER_LOGOUT),
    mergeMap(async () => {
      await firebaseAuth.signOut();
      return clearSession();
    }),
    catchError(err => {
      alert(`Unexpected error: ${err}`);
      console.error(err);
      return of({type:CLEAR_SESSION});
    })
  );
