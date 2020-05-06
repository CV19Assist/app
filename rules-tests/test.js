const firebase = require('@firebase/testing'); // eslint-disable-line import/no-extraneous-dependencies
const fs = require('fs');

/* eslint-env node, mocha */

/*
 * ============
 *    Setup
 * ============
 */
const projectId = process.env.GCLOUD_PROJECT || 'cv19assist-firestore-testing';
const firebasePort = require('../firebase.json').emulators.firestore.port;

const port = firebasePort || 8080;
const coverageUrl = `http://localhost:${port}/emulator/v1/projects/${projectId}:ruleCoverage.html`;

const rules = fs.readFileSync('./firestore.rules', 'utf8');

/**
 * Creates a new app with authentication data matching the input.
 *
 * @param {object} auth the object to use for authentication (typically {uid: some-uid})
 * @return {object} the app.
 */
function authedApp(auth) {
  return firebase.initializeTestApp({ projectId, auth }).firestore();
}
function adminApp(auth) {
  return firebase.initializeAdminApp({ projectId, auth }).firestore();
}

/*
 * ============
 *  Test Cases
 * ============
 */

const TEST_UID = 'UID123';
const TEST_UID2 = 'UID456';

beforeEach(async () => {
  // Clear the database between tests
  await firebase.clearFirestoreData({ projectId });
});

before(async () => {
  await firebase.loadFirestoreRules({ projectId, rules });
});

after(async () => {
  await Promise.all(firebase.apps().map((app) => app.delete()));
  console.log(`View rule coverage information at ${coverageUrl}\n`); // eslint-disable-line no-console
});

describe('CV19Assist app', () => {
  // users
  it('prevents un-authenticated user from creating profile', async () => {
    const db = authedApp(null);
    const usrProfile = db.collection('users').doc(TEST_UID);
    await firebase.assertFails(usrProfile.set({ lastName: 'Smith' }));
  });
  it('allows authenticated user to create profile', async () => {
    const db = authedApp({ uid: TEST_UID });
    const usrProfile = db.collection('users').doc(TEST_UID);
    await firebase.assertSucceeds(usrProfile.set({ lastName: 'Smith' }));
  });
  it("doesn't allow a different user to create profile", async () => {
    const db = authedApp({ uid: TEST_UID2 });
    const usrProfile = db.collection('users').doc(TEST_UID);
    await firebase.assertFails(usrProfile.set({ lastName: 'Smith' }));
  });
  it('prevents un-authenticated user from reading profile', async () => {
    let db = authedApp({ uid: TEST_UID });
    let usrProfile = db.collection('users').doc(TEST_UID);
    await usrProfile.set({ lastName: 'Smith' });
    db = authedApp(null);
    usrProfile = db.collection('users').doc(TEST_UID);
    await firebase.assertFails(usrProfile.get());
  });
  it('allows authenticated user to read profile', async () => {
    let db = authedApp({ uid: TEST_UID });
    let usrProfile = db.collection('users').doc(TEST_UID);
    await usrProfile.set({ lastName: 'Smith' });
    db = authedApp({ uid: TEST_UID });
    usrProfile = db.collection('users').doc(TEST_UID);
    await firebase.assertSucceeds(usrProfile.get());
  });
  it("doesn't allow another user to read profile", async () => {
    let db = authedApp({ uid: TEST_UID });
    let usrProfile = db.collection('users').doc(TEST_UID);
    await usrProfile.set({ lastName: 'Smith' });
    db = authedApp({ uid: TEST_UID2 });
    usrProfile = db.collection('users').doc(TEST_UID);
    await firebase.assertFails(usrProfile.get());
  });
  it("doesn't allow setting of the role", async () => {
    const db = authedApp({ uid: TEST_UID });
    const usrProfile = db.collection('users').doc(TEST_UID);
    await firebase.assertFails(usrProfile.set({ role: 'system-admin' }));
  });

  // users_privileged
  it('prevents un-authenticated user from creating profile', async () => {
    const db = authedApp(null);
    const usrProfile = db.collection('users_privileged').doc(TEST_UID);
    await firebase.assertFails(usrProfile.set({ lastName: 'Smith' }));
  });
  it('allows authenticated user to create profile', async () => {
    const db = authedApp({ uid: TEST_UID });
    const usrProfile = db.collection('users_privileged').doc(TEST_UID);
    await firebase.assertSucceeds(usrProfile.set({ lastName: 'Smith' }));
  });
  it("doesn't allow a different user to create profile", async () => {
    const db = authedApp({ uid: TEST_UID2 });
    const usrProfile = db.collection('users_privileged').doc(TEST_UID);
    await firebase.assertFails(usrProfile.set({ lastName: 'Smith' }));
  });
  it('prevents un-authenticated user from reading profile', async () => {
    let db = authedApp({ uid: TEST_UID });
    let usrProfile = db.collection('users_privileged').doc(TEST_UID);
    await usrProfile.set({ lastName: 'Smith' });
    db = authedApp(null);
    usrProfile = db.collection('users_privileged').doc(TEST_UID);
    await firebase.assertFails(usrProfile.get());
  });
  it('allows authenticated user to read profile', async () => {
    let db = authedApp({ uid: TEST_UID });
    let usrProfile = db.collection('users_privileged').doc(TEST_UID);
    await usrProfile.set({ lastName: 'Smith' });
    db = authedApp({ uid: TEST_UID });
    usrProfile = db.collection('users_privileged').doc(TEST_UID);
    await firebase.assertSucceeds(usrProfile.get());
  });
  it("doesn't allow another user to read profile", async () => {
    let db = authedApp({ uid: TEST_UID });
    let usrProfile = db.collection('users_privileged').doc(TEST_UID);
    await usrProfile.set({ lastName: 'Smith' });
    db = authedApp({ uid: TEST_UID2 });
    usrProfile = db.collection('users_privileged').doc(TEST_UID);
    await firebase.assertFails(usrProfile.get());
  });

  // users_public
  it('prevents any creation of profiles', async () => {
    const db = authedApp({ uid: TEST_UID });
    const usrProfile = db.collection('users_public').doc(TEST_UID);
    await firebase.assertFails(usrProfile.set({ d: { firstName: 'Tim' } }));
  });
  it('allows un-authenticated user to read profile', async () => {
    let db = adminApp({ uid: TEST_UID });
    let usrProfile = db.collection('users_public').doc(TEST_UID);
    await usrProfile.set({ d: { firstName: 'Tim' } });
    db = authedApp(null);
    usrProfile = db.collection('users_public').doc(TEST_UID);
    await firebase.assertSucceeds(usrProfile.get());
  });
  it('allows authenticated other user to read profile', async () => {
    let db = adminApp({ uid: TEST_UID });
    let usrProfile = db.collection('users_public').doc(TEST_UID);
    await usrProfile.set({ lastName: 'Smith' });
    db = authedApp({ uid: TEST_UID2 });
    usrProfile = db.collection('users_public').doc(TEST_UID);
    await firebase.assertSucceeds(usrProfile.get());
  });
});
