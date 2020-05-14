import functionsTestSetup from 'firebase-functions-test';
import chai from 'chai';
import sinon from 'sinon';

process.env.NODE_ENV = 'test';
const projectId = process.env.GCLOUD_PROJECT || 'unit-test-project';
process.env.PUBSUB_PROJECT_ID = projectId;

// Setup firebase-functions-tests to online mode (communicates with emulators)
global.functionsTest = functionsTestSetup({
  databaseURL: `https://${projectId}.firebaseio.com`, // Can not be emulator
  storageBucket: `${projectId}.appspot.com`,
  projectId,
});

global.projectId = projectId;
global.chai = chai;
global.sinon = sinon;
global.expect = chai.expect;
global.assert = chai.assert;
