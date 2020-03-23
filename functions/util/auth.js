const { db, admin } = require("./admin");
const { GeoFirestore } = require("geofirestore");

// Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
// The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Firebase ID Token>`.
// when decoded successfully, the ID Token content will be added as `req.user`.
exports.authenticate = async (req, res, next) => {
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    return res.status(403).send('Unauthorized, missing token');
  }
  const idToken = req.headers.authorization.split('Bearer ')[1];
  try {
    const decodedIdToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedIdToken;
    return next();
  } catch(e) {
    return res.status(403).send('Unauthorized, bad token');
  }
};

// See authenticate for details.  This is basically the same function, but without a 403
// if the user is not logged in.
exports.checkIfUserLoggedIn = async (req, res, next) => {
  req.user = null;
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    return;
  }
  const idToken = req.headers.authorization.split('Bearer ')[1];
  try {
    const decodedIdToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedIdToken;
    next();
    return;
  } catch(e) {
    return;
  }
};

// Given a UID, this returns the basic user profile properties which can be saved in records
// that reference this user.
// Note: This assumes that a profile exists.
exports.getUserProfileSummary = async (uid) => {
  const geofirestore = new GeoFirestore(db);
  const userProfiles = geofirestore.collection("userProfiles");
  const userProfileDoc = await userProfiles.doc(uid).get();
  const userProfile = await userProfileDoc.data();
  return {
    userProfileId: uid,
    firstName: userProfile.firstName,
    displayName: userProfile.displayName,
  };
}