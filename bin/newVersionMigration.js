#!/usr/bin/env node
/* eslint-disable no-console */
const admin = require('firebase-admin');
const { Client } = require('@googlemaps/google-maps-services-js');
const { GeoFirestore } = require('geofirestore');

let geofirestore = null;
let usersPublicGeofirestoreCollection = null;
let requestsPublicGeofirestoreCollection = null;

/**
 * Scrable specific location to a location nearby
 * Based on https://stackoverflow.com/a/31280435/391230
 * @see https://stackoverflow.com/a/31280435/391230
 * @param {object} center - Center of scramble radius
 * @param {number} radiusInMeters - Radius from original point to scramble
 * @returns {object} Object with location scrambled
 */
function scrambleLocation(center, radiusInMeters = 300) {
  const { latitude: y0, longitude: x0 } = center;
  const rd = radiusInMeters / 111300; // about 111300 meters in one degree

  const u = Math.random();
  const v = Math.random();

  const w = rd * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const x = w * Math.cos(t);
  const y = w * Math.sin(t);

  // Adjust the x-coordinate for the shrinking of the east-west distances
  const xp = x / Math.cos(y0);

  const newlat = y + y0;
  const newlon2 = xp + x0;

  return {
    latitude: Math.round(newlat * 1e5) / 1e5,
    longitude: Math.round(newlon2 * 1e5) / 1e5,
  };
}

/**
 * Run promises in a waterfall instead of all the same time (Promise.all)
 * @param {Array} callbacks - List of promises to run in order
 * @return {Promise} Resolves when all promises have completed in order
 */
async function promiseWaterfall(callbacks) {
  return callbacks.reduce(async (accumulator, callback) => {
    accumulator.then(
      typeof callback === 'function' ? callback : () => callback,
    );

    // Add a slight delay to address Google Maps API rate limiting.
    await new Promise((resolve) => setTimeout(resolve, 800));
  }, Promise.resolve());
}

/**
 * Get general location name from
 * @param {number} latitude - Location latitude
 * @param {number} longitude - Location longitude
 */
async function getLocationNameFromLatLong(latitude, longitude) {
  const client = new Client({});
  const requestOptions = {
    params: {
      latlng: { latitude, longitude },
      key: 'AIzaSyBowgXC55EjPKY46v04jH-crZlH_zCaepU',
    },
  };
  let result;
  try {
    const response = await client.reverseGeocode(requestOptions);
    if (response.data.error_message) {
      console.log(
        'Geocoding failed: ',
        JSON.stringify(response.data.error_message),
      );
    }

    [result] = response.data.results;
  } catch (err) {
    console.log(
      `Error calling geocoding for lat: ${latitude} and long: ${longitude}`,
      err.message,
    );
    throw err;
  }

  // // Add a slight delay to address Google Maps API rate limiting.
  await new Promise((resolve) => setTimeout(resolve, 500));

  let locality = null;
  let administrativeAreaLevel1 = null;
  let administrativeAreaLevel3 = null;
  if (result && result.address_components) {
    result.address_components.forEach((addressComp) => {
      if (addressComp.types.includes('locality')) {
        locality = addressComp.long_name;
      }
      if (addressComp.types.includes('administrative_area_level_3')) {
        administrativeAreaLevel3 = addressComp.long_name;
      }
      if (addressComp.types.includes('administrative_area_level_1')) {
        administrativeAreaLevel1 = addressComp.short_name;
      }
    });
  }
  const city = locality || administrativeAreaLevel3;
  const locationName = `${city}, ${administrativeAreaLevel1}`;
  return locationName;
}
/**
 * Convert needs -> requests, requests_public, requests_contact
 */
async function convertRequests() {
  const needsRef = admin.firestore().collection('needs');
  let needsSnap;
  try {
    needsSnap = await needsRef.get();
  } catch (err) {
    console.log(`Error loading needs from firestore: ${err.message}`);
    throw err;
  }
  try {
    // Create a single batch for all needs updates
    const batch = admin.firestore().batch();
    // eslint-disable-next-line no-restricted-syntax
    for (const needSnap of needsSnap.docs) {
      const privateRequest = {
        createdAt: needSnap.get('d.createdAt'),
        firstName: needSnap.get('d.firstName') || null,
        lastName: needSnap.get('d.lastName') || null,
        needs: needSnap.get('d.needs'),
        immediacy: parseInt(needSnap.get('d.immediacy'), 10),
      };
      const lastUpdatedAt = needSnap.get('d.lastUpdatedAt');
      if (lastUpdatedAt) {
        privateRequest.lastUpdatedAt = lastUpdatedAt;
      }
      const coords = needSnap.get('d.coordinates');
      privateRequest.preciseLocation = new admin.firestore.GeoPoint(
        coords.latitude,
        coords.longitude,
      );
      // Get location name from precise lat/long
      // eslint-disable-next-line no-await-in-loop
      const locationName = await getLocationNameFromLatLong(
        coords.latitude,
        coords.longitude,
      );
      privateRequest.generalLocationName = locationName;
      const ownerUid = needSnap.get('d.owner.userProfileId');
      if (ownerUid) {
        privateRequest.owner = ownerUid;
        const { userProfileId, ...otherOwner } = needSnap.get('d.owner');
        privateRequest.ownerInfo = otherOwner;
      }
      const createdByUid = needSnap.get('d.createdBy.userProfileId');
      if (createdByUid) {
        privateRequest.createdBy = createdByUid;
        const { userProfileId, ...otherCreatedBy } = needSnap.get(
          'd.createdBy',
        );
        privateRequest.createdByInfo = otherCreatedBy;
      }

      batch.set(
        admin.firestore().doc(`requests/${needSnap.id}`),
        privateRequest,
      );

      // ==== Public request
      const publicRequest = {
        ...needSnap.get('d'),
        immediacy: parseInt(needSnap.get('d.immediacy'), 10),
      };
      if (ownerUid) {
        publicRequest.owner = ownerUid;
        const { userProfileId, ...otherOwner } = needSnap.get('d.owner');
        publicRequest.ownerInfo = otherOwner;
      }
      if (createdByUid) {
        publicRequest.createdBy = createdByUid;
        const { userProfileId, ...otherCreatedBy } = needSnap.get(
          'd.createdBy',
        );
        publicRequest.createdByInfo = otherCreatedBy;
      }
      publicRequest.generalLocationName = locationName;
      // Add directly using the geofirestore db so it can recalculate the geohash.
      requestsPublicGeofirestoreCollection
        .doc(needSnap.id)
        .set(publicRequest, { customKey: 'generalLocation', merge: true });

      const requestContact = {
        email: needSnap.get('d.email') || null,
        phone: needSnap.get('d.phone') || null,
        contactInfo: needSnap.get('d.contactInfo') || null, // Old contact info.
      };
      batch.set(
        admin.firestore().doc(`requests_contact/${needSnap.id}`),
        requestContact,
      );
    }
    await batch.commit();
    console.log(
      'Successfully converted needs -> requests, copying needs/$needId/history...',
    );

    // Copy needs/$needId/history -> requests_actions
    // Batch copy of all actions for a single need
    await Promise.all(
      needsSnap.docs.map(async (needSnap) => {
        const needActionsRef = admin
          .firestore()
          .collection(`needs/${needSnap.id}/history`);
        const actionsBatch = admin.firestore().batch();
        const needActionsSnap = await needActionsRef.get();
        needActionsSnap.forEach((needActionSnap) => {
          const requestAction = needActionSnap.data();
          requestAction.requestId = needSnap.id;
          requestAction.kind = requestAction.action;
          delete requestAction.action;
          requestAction.createdAt = requestAction.takenAt;
          delete requestAction.takenAt;
          requestAction.createdBy = requestAction.userProfileId || null;
          delete requestAction.userProfileId;

          const actionRef = admin
            .firestore()
            .collection(`requests_actions`)
            .doc();
          actionsBatch.set(actionRef, requestAction);
        });
        await actionsBatch.commit();
      }),
    );
    console.log(
      'Successfully copied needs/$needId/history -> requests_actions',
    );
  } catch (err) {
    console.log(`Error converting needs -> requests: ${err.message}`);
    throw err;
  }
}

/**
 * Convert single user to new format in a batch
 * @param {admin.firestore.DataSnaphot} profileSnap - Profile snapshot
 */
async function convertUser(profileSnap) {
  const batch = admin.firestore().batch();
  const db = admin.firestore();
  const privateUser = {
    firstName: profileSnap.get('d.firstName'),
    displayName: profileSnap.get('d.displayName'),
    lastName: profileSnap.get('d.lastName'),
    createdAt: profileSnap.get('d.createdAt'),
  };
  const coords = profileSnap.get('d.coordinates');
  privateUser.preciseLocation = new admin.firestore.GeoPoint(
    coords.latitude,
    coords.longitude,
  );
  // Get General location name from precise lat/long
  const { latitude, longitude } = profileSnap.get('d.coordinates');
  const locationName = await getLocationNameFromLatLong(latitude, longitude);
  privateUser.generalLocationName = locationName;

  // Add action to batch for setting private user
  batch.set(db.doc(`users/${profileSnap.id}`), privateUser, {
    merge: true,
  });

  // Build public user profile (GeoFirestore format)
  const publicUser = {
    firstName: profileSnap.get('d.firstName'),
    displayName: profileSnap.get('d.displayName'),
    generalLocationName: locationName,
  };
  const scrambledLocation = scrambleLocation(coords, 300);
  publicUser.generalLocation = new admin.firestore.GeoPoint(
    scrambledLocation.latitude,
    scrambledLocation.longitude,
  );
  // Add directly using the geofirestore db so it can recalculate the geohash.
  usersPublicGeofirestoreCollection
    .doc(profileSnap.id)
    .set(publicUser, { customKey: 'generalLocation', merge: true });

  // Build public privileged user object
  const privilegedUser = {
    firstName: profileSnap.get('d.firstName'),
    lastName: profileSnap.get('d.lastName'),
    displayName: profileSnap.get('d.displayName'),
    email: profileSnap.get('d.email'),
    address1: profileSnap.get('d.address1'),
    address2: profileSnap.get('d.address2'),
    city: profileSnap.get('d.city'),
    state: profileSnap.get('d.state'),
    zipcode: profileSnap.get('d.zipcode') || null,
    phone: profileSnap.get('d.phone'),
  };
  // Add action to batch for setting privileged user
  batch.set(db.doc(`users_privileged/${profileSnap.id}`), privilegedUser, {
    merge: true,
  });
  await batch.commit();
}

/**
 * Convert userProfiles to users, users_privileged, users_public
 */
async function convertUsers() {
  console.log('Starting conversion of users');
  const userProfilesRef = admin.firestore().collection('userProfiles');
  // Loading existing user profiles
  let profilesSnap;
  try {
    profilesSnap = await userProfilesRef.get();
    console.log(
      `Loaded ${profilesSnap.size} users from userProfiles, converting to new format...`,
    );
  } catch (err) {
    console.log(`Error loading userProfiles from firestore: ${err.message}`);
    throw err;
  }
  // Covert each user profile to new format in waterfall (one at a time)
  try {
    await promiseWaterfall(profilesSnap.docs.map(convertUser));
    console.log('Successfully converted users');
  } catch (err) {
    console.log(`Error converting userProfiles -> users: ${err.message}`);
    throw err;
  }
}

/**
 * Load service account from SERVICE_ACCOUNT environment variable
 * or local serviceAccount.json.
 */
function loadServiceAccount() {
  if (process.env.SERVICE_ACCOUNT) {
    try {
      return JSON.parse(process.env.SERVICE_ACCOUNT);
    } catch (err) {
      console.log(`Error parsing service account env variable: ${err.message}`);
      throw err;
    }
  }
  try {
    return require(`${__dirname}/../serviceAccount.json`); // eslint-disable-line import/no-dynamic-require, global-require
  } catch (err) {
    console.log(`Error loading service account from file: ${err.message}`);
    throw err;
  }
}

/**
 * Migrate data to new format
 */
async function migrateToNewFormat() {
  const serviceAccount = loadServiceAccount();
  // Init Firebase admin SDK
  const firebaseConfig = {
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
  };
  // Only set service account to credential if not running Firestore emulator and project isn't already set.
  // Needed so that project of service account is not used in place of GCLOUD_PROJECT
  if (!process.env.FIRESTORE_EMULATOR_HOST && !process.env.GCLOUD_PROJECT) {
    firebaseConfig.credential = admin.credential.cert(serviceAccount);
  }
  admin.initializeApp(firebaseConfig);
  geofirestore = new GeoFirestore(admin.firestore());
  usersPublicGeofirestoreCollection = geofirestore.collection('users_public');
  requestsPublicGeofirestoreCollection = geofirestore.collection(
    'requests_public',
  );

  console.log('Converting to new data format...');
  try {
    // Convert needs -> requests, requests_public, requests_contact, requests_actions
    await convertRequests();
    // Convert userProfiles -> users, users_privileged, users_public
    await convertUsers();
    console.log(`Successfully converted Firestore data to new format`);
  } catch (err) {
    console.log('error', err);
    console.log(`Error during migration: ${err.message}`);
    throw err;
  }
}

(async function runConversion() {
  try {
    // Kick off the migration.
    await migrateToNewFormat();
    process.exit(0);
  } catch (err) {
    console.log(`Error migrating to new format: ${err.message}`);
    process.exit(1);
  }
})();
