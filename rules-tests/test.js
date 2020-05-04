const firebase = require("@firebase/testing");
const fs = require("fs");

/*
 * ============
 *    Setup
 * ============
 */
const projectId = "cv19assist-firestore-testing";
const firebasePort = require("../firebase.json").emulators.firestore.port;
const port = firebasePort /** Exists? */ ? firebasePort : 8080;
const coverageUrl = `http://localhost:${port}/emulator/v1/projects/${projectId}:ruleCoverage.html`;

const rules = fs.readFileSync("./firestore.rules", "utf8");

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

const TEST_UID = "UID123";
const TEST_UID2 = "UID456";

beforeEach(async () => {
  // Clear the database between tests
  await firebase.clearFirestoreData({ projectId });
});

before(async () => {
  await firebase.loadFirestoreRules({ projectId, rules });
});

after(async () => {
  await Promise.all(firebase.apps().map(app => app.delete()));
  console.log(`View rule coverage information at ${coverageUrl}\n`);
});

describe("CV19Assist app", () => {

  // users
  it("prevents un-authenticated user from creating profile", async () => {
    let db = authedApp(null);
    let user_profile = db.collection("users").doc(TEST_UID);
    await firebase.assertFails(user_profile.set({ lastName: "Smith" }));
  });
  it("allows authenticated user to create profile", async () => {
    let db = authedApp({uid: TEST_UID});
    let user_profile = db.collection("users").doc(TEST_UID);
    await firebase.assertSucceeds(user_profile.set({ lastName: "Smith" }));
  });
  it("doesn't allow a different user to create profile", async () => {
    let db = authedApp({uid: TEST_UID2});
    let user_profile = db.collection("users").doc(TEST_UID);
    await firebase.assertFails(user_profile.set({ lastName: "Smith" }));
  });
  it("prevents un-authenticated user from reading profile", async () => {
    let db = authedApp({uid: TEST_UID});
    let user_profile = db.collection("users").doc(TEST_UID);
    await user_profile.set({ lastName: "Smith" });
    db = authedApp(null);
    user_profile = db.collection("users").doc(TEST_UID);
    await firebase.assertFails(user_profile.get());
  });
  it("allows authenticated user to read profile", async () => {
    let db = authedApp({uid: TEST_UID});
    let user_profile = db.collection("users").doc(TEST_UID);
    await user_profile.set({ lastName: "Smith" });
    db = authedApp({uid: TEST_UID});
    user_profile = db.collection("users").doc(TEST_UID);
    await firebase.assertSucceeds(user_profile.get());
  });
  it("doesn't allow another user to read profile", async () => {
    let db = authedApp({uid: TEST_UID});
    let user_profile = db.collection("users").doc(TEST_UID);
    await user_profile.set({ lastName: "Smith" });
    db = authedApp({uid: TEST_UID2});
    user_profile = db.collection("users").doc(TEST_UID);
    await firebase.assertFails(user_profile.get());
  });
  it("doesn't allow setting of the role", async () => {
    let db = authedApp({uid: TEST_UID});
    let user_profile = db.collection("users").doc(TEST_UID);
    await firebase.assertFails(user_profile.set({ role: "system-admin" }));
  });

  // users_privileged
  it("prevents un-authenticated user from creating profile", async () => {
    let db = authedApp(null);
    let user_profile = db.collection("users_privileged").doc(TEST_UID);
    await firebase.assertFails(user_profile.set({ lastName: "Smith" }));
  });
  it("allows authenticated user to create profile", async () => {
    let db = authedApp({uid: TEST_UID});
    let user_profile = db.collection("users_privileged").doc(TEST_UID);
    await firebase.assertSucceeds(user_profile.set({ lastName: "Smith" }));
  });
  it("doesn't allow a different user to create profile", async () => {
    let db = authedApp({uid: TEST_UID2});
    let user_profile = db.collection("users_privileged").doc(TEST_UID);
    await firebase.assertFails(user_profile.set({ lastName: "Smith" }));
  });
  it("prevents un-authenticated user from reading profile", async () => {
    let db = authedApp({uid: TEST_UID});
    let user_profile = db.collection("users_privileged").doc(TEST_UID);
    await user_profile.set({ lastName: "Smith" });
    db = authedApp(null);
    user_profile = db.collection("users_privileged").doc(TEST_UID);
    await firebase.assertFails(user_profile.get());
  });
  it("allows authenticated user to read profile", async () => {
    let db = authedApp({uid: TEST_UID});
    let user_profile = db.collection("users_privileged").doc(TEST_UID);
    await user_profile.set({ lastName: "Smith" });
    db = authedApp({uid: TEST_UID});
    user_profile = db.collection("users_privileged").doc(TEST_UID);
    await firebase.assertSucceeds(user_profile.get());
  });
  it("doesn't allow another user to read profile", async () => {
    let db = authedApp({uid: TEST_UID});
    let user_profile = db.collection("users_privileged").doc(TEST_UID);
    await user_profile.set({ lastName: "Smith" });
    db = authedApp({uid: TEST_UID2});
    user_profile = db.collection("users_privileged").doc(TEST_UID);
    await firebase.assertFails(user_profile.get());
  });

  // users_public
  it("prevents any creation of profiles", async () => {
    let db = authedApp({uid: TEST_UID});
    let user_profile = db.collection("users_public").doc(TEST_UID);
    await firebase.assertFails(user_profile.set({ d: { firstName: "Tim" } }));
  });
  it("allows un-authenticated user to read profile", async () => {
    let db = adminApp({uid: TEST_UID});
    let user_profile = db.collection("users_public").doc(TEST_UID);
    await user_profile.set({ d: { firstName: "Tim" } });
    db = authedApp(null);
    user_profile = db.collection("users_public").doc(TEST_UID);
    await firebase.assertSucceeds(user_profile.get());
  });
  it("allows authenticated other user to read profile", async () => {
    let db = adminApp({uid: TEST_UID});
    let user_profile = db.collection("users_public").doc(TEST_UID);
    await user_profile.set({ lastName: "Smith" });
    db = authedApp({uid: TEST_UID2});
    user_profile = db.collection("users_public").doc(TEST_UID);
    await firebase.assertSucceeds(user_profile.get());
  });

});