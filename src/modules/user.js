import Immutable from "immutable";
import { mergeMap, catchError } from 'rxjs/operators';
import { ofType } from 'redux-observable';
import { firebaseAuth } from '../firebase';
import { of, from } from "rxjs";
import API from '../util/api';
import { push } from 'connected-react-router/immutable';

/***** Actions *****/
export const INITIALIZE_USER_AUTH = "INITIALIZE_USER_AUTH";
export const FINISHED_INITIALIZING_AUTH = "FINISHED_INITIALIZING_AUTH";

export const USER_ALREADY_LOGGED_IN = "USER_ALREADY_LOGGED_IN";
export const USER_NOT_ALREADY_LOGGED_IN = "USER_NOT_ALREADY_LOGGED_IN";
export const USER_LOGGED_IN = "USER_LOGGED_IN";
export const CLEAR_SESSION = "CLEAR_SESSION";

export const SAVE_USER_PROFILE = "SAVE_USER_PROFILE";
export const SAVE_USER_PROFILE_SUCCEEDED = "SAVE_USER_PROFILE_SUCCEEDED";
export const SAVE_USER_PROFILE_FAILED = "SAVE_USER_PROFILE_FAILED";

export const CACHE_LAUNCH_URL = "CACHE_LAUNCH_URL";

// This is a special case that's dealt in reducers/index so we export it.
export const USER_LOGOUT = "USER_LOGOUT";

const defaultState = Immutable.Map({
  isInitialized: false,
  isAuthenticated: false,
  authUser: null,
  userProfile: null,
  launchURL: null,
  state: "", // "", checking, loggingIn, loginFailed, loginSuccessful
});

const moduleDomainRoot = ["user"];

/***** Reducers *****/
export function reducer(state = defaultState, action) {
  // If the module state hasn't been initialized yet then do that first.
  if (!state.getIn(moduleDomainRoot)) {
    state = state.setIn(moduleDomainRoot, defaultState);
  }

  switch (action.type) {
    case INITIALIZE_USER_AUTH:
      return state
        .setIn([...moduleDomainRoot, "isInitialized"], false)
        .setIn([...moduleDomainRoot, "state"], "checking")
        .setIn([...moduleDomainRoot, "authUser"], null)
        .setIn([...moduleDomainRoot, "userProfile"], null)
        .setIn([...moduleDomainRoot, "isAuthenticated"], false);

    case FINISHED_INITIALIZING_AUTH:
      return state
        .setIn([...moduleDomainRoot, "isInitialized"], true);

    case USER_LOGGED_IN:
      return state
        .setIn([...moduleDomainRoot, "state"], "loggedIn")
        .setIn([...moduleDomainRoot, "authUser"], action.firebaseUser)
        .setIn([...moduleDomainRoot, "userProfile"], Immutable.fromJS(action.userProfile))
        .setIn([...moduleDomainRoot, "isAuthenticated"], true);

    case SAVE_USER_PROFILE_SUCCEEDED:
      return state
        .setIn([...moduleDomainRoot, "userProfile"], Immutable.fromJS(action.userProfile));

    case USER_NOT_ALREADY_LOGGED_IN:
      return state
        .setIn([...moduleDomainRoot, "state"], "")
        .setIn([...moduleDomainRoot, "isAuthenticated"], false);

    case CACHE_LAUNCH_URL:
      return state
        .setIn([...moduleDomainRoot, "launchURL"], action.url);

    default:
      return state;
  }
}

/***** Action Creators *****/
export const initializeUserAuth = () => ({ type: INITIALIZE_USER_AUTH });
export const finishedInitializingAuth = () => ({ type: FINISHED_INITIALIZING_AUTH });

export const logout = () => ({ type: USER_LOGOUT });
export const userNotAlreadyLoggedIn = () => ({ type: USER_NOT_ALREADY_LOGGED_IN });
export const clearSession = () => ({ type: CLEAR_SESSION });

export const userLoggedIn = (userProfile, firebaseUser) => ({ type: USER_LOGGED_IN, userProfile, firebaseUser });

export const saveUserProfile = (profileData) => ({ type: SAVE_USER_PROFILE, profileData });
export const saveUserProfileSucceeded = (userProfile) => ({ type: SAVE_USER_PROFILE_SUCCEEDED, userProfile });
export const saveUserProfileFailed = (error) => ({ type: SAVE_USER_PROFILE_FAILED, error });

export const cacheLaunchURL = (url) => ({ type: CACHE_LAUNCH_URL, url });


/***** side effects, only as applicable. e.g. thunks, epics, etc *****/
export const userCheckEpic = (action$, state$) =>
  action$.pipe(
    ofType(INITIALIZE_USER_AUTH),
    mergeMap(() => {
      let firebaseUser = firebaseAuth.currentUser;
      // If user is logged in then get their profile.
      if (firebaseUser) {
        return from(API.setFirebaseUserAndGetToken(firebaseUser)).pipe(
          mergeMap(token => {
            API.setIdToken(token);
            return API.getAuthenticatedRequestObservable("/user/profile").pipe(
              mergeMap(resp => {
                const userProfile = resp.response;
                const redirectPath = state$.value.getIn(["user", "launchURL"]) || "/";
                return [userLoggedIn(userProfile, firebaseUser), push(redirectPath), finishedInitializingAuth()];
              }),
              catchError(err => {
                // User needs profile.
                if (err.status === 404) {
                  return [userLoggedIn(null, firebaseUser), push("/new-user"), finishedInitializingAuth()];
                }
                alert(`Unexpected error: ${err}`);
                console.error(err);
                // TODO: What to return here?
                return {};
              })
            )
          })
        );
      } else {
        return [userNotAlreadyLoggedIn(), finishedInitializingAuth()];
      }
    }),
  );

export const logoutEpic = action$ =>
  action$.pipe(
    ofType(USER_LOGOUT),
    mergeMap(async () => {
      await firebaseAuth.signOut();
      // TODO: Some hacky stuff going on here!
      window.location = "/";
      return clearSession();
    }),
    catchError(err => {
      alert(`Unexpected error: ${err}`);
      console.error(err);
      return of({ type: CLEAR_SESSION });
    })
  );


export const saveUserProfileEpic = action$ =>
  action$.pipe(
    ofType(SAVE_USER_PROFILE),
    mergeMap(action => {
      const profileData = action.profileData;
      profileData.displayName = `${profileData.firstName} ${profileData.lastName}`;
      return API.getAuthenticatedJSONRequestObservable("/user/profile", "post", profileData).pipe(
        mergeMap(resp => {
          console.log(resp);
          return [saveUserProfileSucceeded(profileData), push("/search")];
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
