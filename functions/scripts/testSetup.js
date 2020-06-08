import functionsTestSetup from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

const {
  GCLOUD_PROJECT: projectId,
  FIREBASE_DATABASE_EMULATOR_HOST,
  FIRESTORE_EMULATOR_HOST,
} = process.env;
process.env.NODE_ENV = 'test';
process.env.PUBSUB_PROJECT_ID = projectId;

// Setup firebase-functions-tests to online mode (communicates with emulators)
global.functionsTest = functionsTestSetup({
  databaseURL: `https://${projectId}.firebaseio.com`, // Can not be emulator
  storageBucket: `${projectId}.appspot.com`,
  projectId,
});

chai.use(sinonChai);
global.projectId = projectId;
global.chai = chai;
global.sinon = sinon;
global.expect = chai.expect;
global.assert = chai.assert;

/**
 * Initialize firebase-admin SDK with emulator settings for RTDB
 * NOTE: Global setup is needed since cloud functions are imported from the index of
 * the function folder instead of from the top level index.js (where initializeApp is called)
 */
admin.initializeApp({
  projectId,
  databaseURL: `http://${FIREBASE_DATABASE_EMULATOR_HOST}?ns=${projectId}`,
  credential: admin.credential.applicationDefault(),
});

// Initialize Firestore with emulator settings from environment
const [servicePath, portStr] = FIRESTORE_EMULATOR_HOST.split(':');
admin.firestore().settings({
  servicePath,
  port: parseInt(portStr, 10),
});
