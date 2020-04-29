#!/usr/bin/env node
/* eslint-disable no-console */
const admin = require('firebase-admin');
const readline = require('readline');

const rl = readline.createInterface(process.stdin, process.stdout);

/**
 * Convert userProfiles to users, users_privileged, users_public
 */
async function deleteCollections() {
  const collections = [
    'requests',
    'requests_actions',
    'requests_public',
    'requests_contact',
    'users',
    'users_public',
    'users_privileged',
  ];

  // eslint-disable-next-line no-restricted-syntax
  for (const collection of collections) {
    process.stdout.write(`Deleting collection '${collection}':`);
    try {
      const batch = admin.firestore().batch();
      // eslint-disable-next-line no-await-in-loop
      const col = await admin.firestore().collection(collection).get();
      col.docs.forEach((qsDoc) => {
        process.stdout.write('.');
        batch.delete(qsDoc.ref);
      });
      // eslint-disable-next-line no-await-in-loop
      await batch.commit();
      process.stdout.write(`Successful`);
    } catch (err) {
      console.log(
        `\n\tError loading userProfiles from firestore: ${err.message}`,
      );
      throw err;
    }
    process.stdout.write('\n');
  }
}

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
async function migrateToNewFormat() {
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

  console.log('Deleting collections...');
  try {
    await deleteCollections();
    console.log(`Successfully deleted`);
  } catch (err) {
    console.log('error', err);
    console.log(`Error deleting collections: ${err.message}`);
    throw err;
  }
}

(async function run() {
  rl.question(
    'This will delete collections, are you sure? (y/N) ',
    async (answer) => {
      if (answer !== 'y') {
        console.log('Aborting');
        process.exit();
      }

      try {
        // Upload all email templates
        await migrateToNewFormat();
        process.exit(0);
      } catch (err) {
        console.log(`Error deleting templates: ${err.message}`);
        process.exit(1);
      }
    },
  );
})();
