// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************
const cypressFirebasePlugin = require('cypress-firebase').plugin;
const admin = require('firebase-admin');

module.exports = (on, config) => {
  require('cypress-log-to-output').install(on); // eslint-disable-line global-require
  return cypressFirebasePlugin(
    on,
    {
      ...config,
      env: {
        ...(config.env || {}),
        TEST_UID: process.env.TEST_UID,
        FIREBASE_API_KEY: process.env.REACT_APP_FIREBASE_API_KEY,
        FIREBASE_PROJECT_ID: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      },
      baseUrl: 'http://localhost:3000',
    },
    admin,
  );
};
