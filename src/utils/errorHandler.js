import { firebase, env as environment } from '../config';
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
        key: firebase.apiKey,
        projectId: firebase.projectId,
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
  if (environment !== 'dev') {
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
  if (auth && auth.uid && environment !== 'dev') {
    // Set user within Stackdriver
    if (errorHandler && errorHandler.setUser) {
      errorHandler.setUser(auth.uid);
    }
  }
}

export default errorHandler;
