import * as firebaseTesting from '@firebase/testing';
import functionsTestSetup from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import { GeoFirestore } from 'geofirestore';
import requestCreatedOriginal from './index';

const REQUEST_ID = '123ABC';
const context = {
  params: { requestId: REQUEST_ID },
};
// Setup firebase-functions-tests to online mode (will communicate with emulators)
const functionsTest = functionsTestSetup({
  databaseURL: `https://${projectId}.firebaseio.com`, // Can not be emulator
  storageBucket: `${projectId}.appspot.com`,
  projectId,
});
const requestCreated = functionsTest.wrap(requestCreatedOriginal);

const adminApp = firebaseTesting.initializeAdminApp({
  projectId,
  databaseName: projectId,
});

const DEFAULT_LATITUDE = 43.074585;
const DEFAULT_LONGITUDE = -89.384182;

// Skipped since pubsub emulator returns "Failed to parse target 8085:undefined"
describe('requestCreated PubSub Cloud Function (pubsub:onPublish)', () => {
  beforeEach(async () => {
    // Clean database before each test
    await firebaseTesting.clearFirestoreData({ projectId });
  });

  it('exits if general location does not exist', async () => {
    const requestId = 'ABC123';
    const requestObj = { displayName: 'some', email: 'test@test.com' };
    const snap = functionsTest.firestore.makeDocumentSnapshot(
      requestObj,
      `requests/${requestId}`,
    );
    // topic.on('message', messageHandler);
    // Calling wrapped function with fake snap and context
    const result = await requestCreated(snap, context);
    expect(result).to.be.null;
    // Listen for new messages until timeout is hit
    // Load data to confirm user has been deleted
  });

  it('exits if no users are nearby request', async () => {
    // TODO: Switch to a Geopoint once it is supported for Firebase testing
    // const requestObj = { generalLocation: new admin.firestore.GeoPoint(0, 0) };
    const requestObj = {
      generalLocation: {
        latitude: DEFAULT_LATITUDE,
        longitude: DEFAULT_LONGITUDE,
      },
    };
    const snap = functionsTest.firestore.makeDocumentSnapshot(
      requestObj,
      'requests/ABC123',
    );
    // Calling wrapped function with fake snap and context
    const result = await requestCreated(snap, context);
    expect(result).to.be.null;
  });

  // Skipped since Firestore Emulator doesn't currently support Geopoints
  it.skip('sends message to users within range', async function () {
    this.timeout(10000);
    const requestId = 'ABC123';
    // TODO: Switch to a Geopoint once it is supported for Firebase testing
    // const requestObj = { generalLocation: new admin.firestore.GeoPoint(0, 0) };
    const requestObj = {
      generalLocation: {
        latitude: 43.074586,
        longitude: DEFAULT_LONGITUDE,
      },
    };
    const snap = functionsTest.firestore.makeDocumentSnapshot(
      requestObj,
      `requests/${requestId}`,
    );
    const userObject = {
      displayName: 'asdf',
      generalLocation: new admin.firestore.GeoPoint(
        DEFAULT_LATITUDE,
        DEFAULT_LONGITUDE,
      ),
    };
    const geofirestore = new GeoFirestore(adminApp.firestore());
    await geofirestore
      .collection('users_public')
      .doc('ABC123')
      .set(userObject, { customKey: 'generalLocation' });
    const usersPublic = await adminApp
      .firestore()
      .collection('users_public')
      .get();
    usersPublic.docs.forEach((docSnap) => {
      console.log('doc', docSnap.data());
    });
    // console.log('After user create', usersPublic);
    // Calling wrapped function with fake snap and context
    const result = await requestCreated(snap, context);
    expect(result).to.be.null;
    // Listen for new messages until timeout is hit
    // Load data to confirm user has been deleted
  });
});
