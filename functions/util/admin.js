const admin = require("firebase-admin");

// if (process.env.FUNCTIONS_EMULATOR) {
//   // admin.initializeApp({
//   //   // project_id: "cv19assist-dev",
//   //   credential: admin.credential.applicationDefault(),
//   //   databaseURL: "http://localhost:8080"
//   // });

//   // const serviceAccount = require("../firebase-adminsdk.json");
//   // admin.initializeApp({
//   //   project_id: "cv19assist-dev",
//   //   credential: admin.credential.cert(serviceAccount),
//   //   databaseURL: "https://cv19assist-dev.firebaseio.com"
//   // });

//   const serviceAccount = require("../firebase-adminsdk-prod.json");
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     databaseURL: "https://cv19assist-bfa5f.firebaseio.com"
//   });
// } else {
//   admin.initializeApp();
// }

  const serviceAccount = require("../firebase-adminsdk-prod.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://cv19assist-bfa5f.firebaseio.com"
  });


const db = admin.firestore();

module.exports = { admin, db };