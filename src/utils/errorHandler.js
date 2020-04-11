import { version } from '../../package.json';

let errorHandler; // eslint-disable-line import/no-mutable-exports

/**
 * Initialize Stackdriver Error Reporter only if api key exists
 */
function initStackdriverErrorReporter() {
  if (typeof window.StackdriverErrorReporter === 'function') {
    window.addEventListener('DOMContentLoaded', () => {
      errorHandler = new window.StackdriverErrorReporter();
      errorHandler.start({
        key: process.env.REACT_APP_FIREBASE_API_KEY,
        projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
        service: 'app-site',
        version,
      });
    });
  }
  return errorHandler;
}

/**
 * Initialize client side error reporting. Error handling is only
 * initialized if in production environment.
 */
export function init() {
  if (!window.location.hostname.includes('localhost')) {
    initStackdriverErrorReporter();
  } else {
    errorHandler = console.error; // eslint-disable-line no-console
  }
}

/**
 * Set user's uid within error reporting context (can be one or
 * many error handling utilities)
 * @param {Object} auth - Authentication data
 * @param {String} auth.uid - User's id
 */
export function setErrorUser(auth) {
  if (auth && auth.uid) {
    // Set user within Stackdriver
    if (errorHandler && errorHandler.setUser) {
      errorHandler.setUser(auth.uid);
    }
  }
}

export default errorHandler;
