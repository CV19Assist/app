import * as firebaseTesting from '@firebase/testing';
import indexUserOriginal from './index';

const USER_UID = '123ABC';
const USERS_COLLECTION = 'users';
const USER_PATH = `${USERS_COLLECTION}/${USER_UID}`;
const USER_PUBLIC_PATH = `users_public/${USER_UID}`;
const context = {
  params: { userId: USER_UID },
};

const adminApp = firebaseTesting.initializeAdminApp({
  projectId,
  databaseName: projectId,
});

const indexUser = functionsTest.wrap(indexUserOriginal);
const userFirestoreRef = adminApp.firestore().doc(USER_PUBLIC_PATH);
const privilegedProfileRef = adminApp
  .firestore()
  .doc(`users_privileged/${USER_UID}`);

// Skipped due to "Unexpected token u in JSON at position 0" error. It seems to
// be due to FIREBASE_CONFIG becoming undefined during test run (when using functionsTest.firestore).
// It appears to be a buck within firebase-functions-test
// TODO: Un-skip once this issue is fixed
describe.skip('indexUser Firestore Cloud Function (firestore:onWrite)', () => {
  beforeEach(async () => {
    // Clean database before each test
    await firebaseTesting.clearFirestoreData({ projectId });
  });

  after(async () => {
    functionsTest.cleanup();
    // Cleanup all apps (keeps active listeners from preventing JS from exiting)
    await Promise.all(firebaseTesting.apps().map((app) => app.delete()));
  });

  it('adds user to users_public on create event', async () => {
    const userData = { displayName: 'some', email: 'test@test.com' };
    // Build a Firestore create event object on users path
    const beforeSnap = functionsTest.firestore.makeDocumentSnapshot(
      null,
      USER_PATH,
    );
    const afterSnap = functionsTest.firestore.makeDocumentSnapshot(
      userData,
      USER_PATH,
    );
    const changeEvent = { before: beforeSnap, after: afterSnap };
    // Calling wrapped function with fake snap and context
    await indexUser(changeEvent, context);
    // Load data to confirm user has been deleted
    const newUserRes = await userFirestoreRef.get();
    expect(newUserRes.data()).to.have.nested.property(
      'd.displayName',
      userData.displayName,
    );
    expect(newUserRes.data()).to.not.have.nested.property(
      'd.email',
      userData.email,
    );
  });

  it('adds user to users_privileged on create event', async () => {
    const userData = { displayName: 'some', email: 'test@test.com' };
    // Build a Firestore create event object on users path
    const beforeSnap = functionsTest.firestore.makeDocumentSnapshot(
      null,
      USER_PATH,
    );
    const afterSnap = functionsTest.firestore.makeDocumentSnapshot(
      userData,
      USER_PATH,
    );
    const changeEvent = { before: beforeSnap, after: afterSnap };
    // Calling wrapped function with fake snap and context
    await indexUser(changeEvent, context);
    // Load data to confirm user has been deleted
    const newUserRes = await privilegedProfileRef.get();
    expect(newUserRes.data()).to.have.property(
      'displayName',
      userData.displayName,
    );
    expect(newUserRes.data()).to.have.property('email', userData.email);
  });

  it('updates existing user in users_public on update event', async () => {
    const initialUserData = { displayName: 'initial' };
    const userData = { displayName: 'afterchange', email: 'test@test.com' };
    // Create update snapshot on users collection document with user's id
    const beforeSnap = functionsTest.firestore.makeDocumentSnapshot(
      initialUserData,
      USER_PATH,
    );
    const afterSnap = functionsTest.firestore.makeDocumentSnapshot(
      userData,
      USER_PATH,
    );
    const changeEvent = { before: beforeSnap, after: afterSnap };
    // Calling wrapped function with fake snap and context
    await indexUser(changeEvent, context);
    // Load data to confirm user has been deleted
    const newUserRes = await userFirestoreRef.get();
    expect(newUserRes.data()).to.have.nested.property(
      'd.displayName',
      userData.displayName,
    );
    expect(newUserRes.data()).to.not.have.nested.property(
      'd.email',
      userData.email,
    );
    // TODO: Check for coordinates once they are copied
  });

  it('removes user from Firestore on delete event', async () => {
    const userData = { some: 'data' };
    // Build a Firestore create event object on users path
    const beforeSnap = functionsTest.firestore.makeDocumentSnapshot(
      userData,
      USER_PATH,
    );
    const afterSnap = functionsTest.firestore.makeDocumentSnapshot(
      null,
      USER_PATH,
    );
    const changeEvent = { before: beforeSnap, after: afterSnap };
    // Calling wrapped function with fake snap and context
    await indexUser(changeEvent, context);
    // Load data to confirm user has been deleted
    const newUserRes = await userFirestoreRef.get();
    expect(newUserRes.exists).to.be.false;
    expect(newUserRes.data()).to.be.undefined;
  });
});
