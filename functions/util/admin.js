const admin = require("firebase-admin");

if (process.env.FUNCTIONS_EMULATOR) {
  const serviceAccount = require("../firebase-adminsdk.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://cv19assist-dev.firebaseio.com"
  });
} else {
  admin.initializeApp();
}


const db = admin.firestore();

module.exports = { admin, db };