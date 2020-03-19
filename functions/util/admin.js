const admin = require("firebase-admin");

// const serviceAccount = require("../firebase-adminsdk.json");
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://cv19assist-dev.firebaseio.com"
// });

admin.initializeApp();

const db = admin.firestore();

module.exports = { admin, db };