#!/usr/bin/env node
/* eslint-disable no-console */
const admin = require('firebase-admin');

/**
 * Load service account from SERVICE_ACCOUNT environment variable
 * or local serviceAccount.json.
 */
function loadServiceAccount() {
  if (process.env.SERVICE_ACCOUNT) {
    try {
      return JSON.parse(process.env.SERVICE_ACCOUNT);
    } catch (err) {
      console.log(`Error parsing service account env variable: ${err.message}`);
      throw err;
    }
  }
  try {
    return require(`${__dirname}/../serviceAccount.json`); // eslint-disable-line import/no-dynamic-require, global-require
  } catch (err) {
    console.log(`Error loading service account from file: ${err.message}`);
    throw err;
  }
}

/**
 * Migrate data to new format
 */
async function runQuery() {
  const serviceAccount = loadServiceAccount();
  // Init Firebase admin SDK
  const firebaseConfig = {
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
  };
  // Only set service account to credential if not running Firestore emulator and project isn't already set.
  // Needed so that project of service account is not used in place of GCLOUD_PROJECT
  if (!process.env.FIRESTORE_EMULATOR_HOST && !process.env.GCLOUD_PROJECT) {
    firebaseConfig.credential = admin.credential.cert(serviceAccount);
  }
  admin.initializeApp(firebaseConfig);

  console.log('Running query');
  try {
    // const col = admin.firestore().collection('users_public');
    const col = admin.firestore().collection('userProfiles');
    const qs = await col.get();
    // eslint-disable-next-line no-restricted-syntax
    for (const queryDoc of qs.docs) {
      // console.log(queryDoc.get('d.generalLocationName'));
      console.log(queryDoc.get('d.coordinates'));
    }
  } catch (err) {
    console.log('error', err);
    console.log(`Error with query: ${err.message}`);
    throw err;
  }
}

(async function runFunction() {
  try {
    await runQuery();
    process.exit(0);
  } catch (err) {
    console.log(`Error with query: ${err.message}`);
    process.exit(1);
  }
})();
