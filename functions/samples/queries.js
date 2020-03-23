const { db, admin } = require('../util/admin')
const { GeoFirestore } = require("geofirestore");

// Create a GeoFirestore reference
const geofirestore = new GeoFirestore(db);
const needsCollection = geofirestore.collection("needs");
const usersProfilesCollection = geofirestore.collection("userProfiles");

const query = async () => {
  // // const doc = await geocollection.get("82IUAFfZUMDEVXzFU3lA").where("status", "!=", "completed");
  // const docs = await needsCollection.where("status", "=", "1");
  // console.log(docs);

  // // geolocation with where.
  // const docs = needsCollection.near({
  //   center: new admin.firestore.GeoPoint(
  //     43.06712995891949,
  //     -89.53046264648438
  //   ),
  //   radius: 10
  // }).where("status", "<", 10);
  // console.log(docs);

  const docs = await needsCollection
  .near({
    center: new admin.firestore.GeoPoint(
      // 43.06712995891949,
      // -89.53046264648438
      42.9986909,
      -89.5533377
    ),
    radius: 30 * 1.609344
  })
  .where("status", "==", 1)
  .get();

  console.log(docs);

  // user search with uid.
  // try {
  //   const userProfile = await usersProfilesCollection.get("EwIDLGi0d7gsttj73aWxUgAbD4f1");
  //   console.log(userProfile);
  // } catch(err) {
  //   console.log(err);
  // }
}


query();