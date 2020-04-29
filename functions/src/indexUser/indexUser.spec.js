import * as firebaseTesting from '@firebase/testing';
import { NOTIFICATIONS_SETTINGS_DOC } from 'constants/firestorePaths';
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
// const userFirestoreRef = adminApp.firestore().doc(USER_PATH);
const userPublicFirestoreRef = adminApp.firestore().doc(USER_PUBLIC_PATH);
const userPrivilegedRef = adminApp
  .firestore()
  .doc(`users_privileged/${USER_UID}`);

const sampleLocation = {
  latitude: 43.074585,
  longitude: -89.384182,
};
const sampleUserData = {
  preciseLocation: sampleLocation,
  generalLocation: sampleLocation,
  generalLocationName: 'Madison, WI',
  firstName: 'TestUserFirst',
  displayName: 'some',
  email: 'test@test.com',
};
const notificationSettings = {
  newUser: ['someId'],
  newRequest: ['someId'],
};

describe('indexUser Firestore Cloud Function (firestore:onWrite)', () => {
  beforeEach(async () => {
    // Clean database before each test
    await firebaseTesting.clearFirestoreData({ projectId });
    await adminApp
      .firestore()
      .doc(NOTIFICATIONS_SETTINGS_DOC)
      .set(notificationSettings, { merge: true });
  });

  it('adds user to users_public on create event', async () => {
    // Build a Firestore create event object on users path
    const beforeSnap = functionsTest.firestore.makeDocumentSnapshot(
      null,
      USER_PATH,
    );
    const afterSnap = functionsTest.firestore.makeDocumentSnapshot(
      sampleUserData,
      USER_PATH,
    );
    const changeEvent = { before: beforeSnap, after: afterSnap };
    // Calling wrapped function with fake snap and context
    await indexUser(changeEvent, context);
    // Load data to confirm user has been deleted
    // const newUserRes = await userFirestoreRef.get();
    const newUserPublicRes = await userPublicFirestoreRef.get();
    // expect(newUserRes.data()).to.have.property('role', 'user');
    expect(newUserPublicRes.data()).to.have.nested.property(
      'd.firstName',
      sampleUserData.firstName,
    );
    expect(newUserPublicRes.data()).to.have.nested.property(
      'd.firstName',
      sampleUserData.firstName,
    );
    expect(newUserPublicRes.data()).to.have.nested.property(
      'd.displayName',
      sampleUserData.displayName,
    );
    expect(newUserPublicRes.data()).to.not.have.nested.property(
      'd.email',
      sampleUserData.email,
    );
  });

  it('adds user to users_privileged on create event', async () => {
    // Build a Firestore create event object on users path
    const beforeSnap = functionsTest.firestore.makeDocumentSnapshot(
      null,
      USER_PATH,
    );
    const afterSnap = functionsTest.firestore.makeDocumentSnapshot(
      sampleUserData,
      USER_PATH,
    );
    const changeEvent = { before: beforeSnap, after: afterSnap };
    // Calling wrapped function with fake snap and context
    await indexUser(changeEvent, context);
    // Load data to confirm user has been deleted
    const newUserRes = await userPrivilegedRef.get();
    expect(newUserRes.data()).to.have.property(
      'displayName',
      sampleUserData.displayName,
    );
    expect(newUserRes.data()).to.have.property('email', sampleUserData.email);
  });

  it('updates existing user in users_public on update event', async () => {
    const initialUserData = sampleUserData;
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
    const newUserRes = await userPublicFirestoreRef.get();
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
    const newUserRes = await userPublicFirestoreRef.get();
    expect(newUserRes.exists).to.be.false;
    expect(newUserRes.data()).to.be.undefined;
  });
});
