import * as functions from 'firebase-functions';
import { get } from 'lodash';

/**
 * Get config variable from environment. Throws clear message for non existent variables.
 * @param {string} getPath - Path of config var to get from environment
 * @param {string} defaultVal - Default value to fallback to if environment config is not defined
 * @example <caption>Basic</caption>
 * const frontEndConfig = getEnvConfig('frontend') // functions.config().frontend
 * @example <caption>Deep Value</caption>
 * const frontEndUrl = getEnvConfig('frontend.url') // functions.config().frontend.url
 * @example <caption>Prevent Throwing</caption>
 * // Falsey default value (other than undefined) prevents throw
 * const someVal = getEnvConfig('some.empty, null) || 'asdf' // defaults to asdf without throwing
 * @returns {any} - Value of environment variable
 */
export function getEnvConfig(getPath, defaultVal) {
  if (!getPath) {
    console.warn(
      'Getting top level config can cause things to break, pass a get path to getEnvConfig',
    );
    return functions.config();
  }
  const varValue = get(functions.config(), getPath) || defaultVal;
  if (typeof varValue === 'undefined') {
    throw new Error(
      `${getPath} functions config variable not set, check functions/.runtimeconfig.json`,
    );
  }
  return varValue;
}

/**
 * Parse FIREBASE_CONFIG environment variable (set in functions >= 1.0.0)
 * with error handling. If parsing fails, null is returned.
 * @returns {object} Firebase config object
 * @memberof utils
 */
function parseFirebaseConfigVar() {
  try {
    return JSON.parse(process.env.FIREBASE_CONFIG);
  } catch (err) {
    console.error('Error parsing Firebase config:', err);
    return null;
  }
}

/**
 * Get the firebase config of the current functions environment. This is done by
 * loading functions config if available (functions < 1.0.0) then falling back to
 * the FIREBASE_CONFIG environment variable (functions >= 1.0.0). Otherwise fall
 * back to parsing from FIREBASE_CONFIG environment variable (v1 and beyond).
 * @param {string} getPath - Path from which to get config value
 * @returns {object|string} Parameter from firebase config or firebase config object
 * @example Basic
 * getFirebaseConfig()
 * // => {
 * //   databaseURL: 'https://databaseName.firebaseio.com',
 * //   storageBucket: 'projectId.appspot.com',
 * //   projectId: 'projectId'
 * // }
 * @example Get Value
 * getFirebaseConfig('projectId')
 * // => "myProject"
 * @memberof utils
 */
export function getFirebaseConfig(getPath) {
  // Otherwise fall back to parsing from FIREBASE_CONFIG environment variable (v1 and beyond)
  const fbConfig = parseFirebaseConfigVar();

  if (!getPath) {
    return fbConfig;
  }
  return fbConfig[getPath];
}
