#!/usr/bin/env node
/* eslint-disable no-console */
const admin = require('firebase-admin');
const { Client } = require('@googlemaps/google-maps-services-js');

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
function promiseWaterfall(callbacks) {
  return callbacks.reduce(
    (accumulator, callback) =>
      accumulator.then(
        typeof callback === 'function' ? callback : () => callback,
      ),
    Promise.resolve(),
  );
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
    needsSnap.docs.forEach((needSnap) => {
      const privateRequest = {
        createdAt: needSnap.get('d.createdAt'),
        firstName: needSnap.get('d.firstName') || null,
        lastName: needSnap.get('d.lastName') || null,
        needs: needSnap.get('d.needs'),
        preciseLocation: needSnap.get('d.coordinates'),
        immediacy: parseInt(needSnap.get('d.immediacy'), 10),
      };
      if (needSnap.get('d.createdBy.userProfileId')) {
        privateRequest.createdBy = needSnap.get('d.createdBy.userProfileId');
        privateRequest.createdByInfo = {
          firstName: needSnap.get('d.createdBy.firstName'),
          displayName: needSnap.get('d.createdBy.displayName'),
          uid: needSnap.get('d.createdBy.userProfileId'),
        };
      }

      batch.set(
        admin.firestore().doc(`requests/${needSnap.id}`),
        privateRequest,
        {
          merge: true,
        },
      );

      const publicRequest = {
        ...needSnap.data(),
        d: {
          ...needSnap.get('d'),
          immediacy: parseInt(needSnap.get('d.immediacy'), 10),
        },
      };
      if (needSnap.get('d.owner.userProfileId')) {
        publicRequest.owner = needSnap.get('d.owner.userProfileId');
        publicRequest.ownerInfo = {
          uid: needSnap.get('d.owner.userProfileId'),
          firstName: needSnap.get('d.owner.firstName'),
          displayName: needSnap.get('d.owner.displayName'),
        };
      }
      if (needSnap.get('d.createdBy.userProfileId')) {
        publicRequest.createdBy = privateRequest.createdBy;
        publicRequest.createdByInfo = privateRequest.createdByInfo;
      }
      batch.set(
        admin.firestore().doc(`requests_public/${needSnap.id}`),
        publicRequest,
        { merge: true },
      );

      const requestContact = {
        email: needSnap.get('d.email') || null,
        phone: needSnap.get('d.phone') || null,
        contactInfo: needSnap.get('d.contactInfo') || null, // Old contact info.
      };
      batch.set(
        admin.firestore().doc(`requests_contact/${needSnap.id}`),
        requestContact,
        { merge: true },
      );
    });
    await batch.commit();
    console.log(
      'Successfully converted needs -> requests, copying needs/$needId/history...',
    );

    // Copy needs/$needId/history -> requests/$requestId/actions
    // Batch copy of all actions for a single need
    await Promise.all(
      needsSnap.docs.map(async (needSnap) => {
        const needActionsRef = admin
          .firestore()
          .collection(`needs/${needSnap.id}/history`);
        const actionsBatch = admin.firestore().batch();
        const needActionsSnap = await needActionsRef.get();
        needActionsSnap.forEach((needActionSnap) => {
          actionsBatch.set(
            admin.firestore().doc(`requests_actions/${needSnap.id}/actions`),
            needActionSnap,
          );
        });
        await actionsBatch.commit();
      }),
    );
    console.log(
      'Successfully copied needs/$needId/history -> requests/$requestId/actions',
    );
  } catch (err) {
    console.log(`Error converting needs -> requests: ${err.message}`);
    throw err;
  }
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

  const response = await client.reverseGeocode(requestOptions);
  const [result] = response.data.results;
  let locality = null;
  let administrativeAreaLevel1 = null;
  result.address_components.forEach((addressComp) => {
    if (addressComp.types.includes('locality')) {
      locality = addressComp.long_name;
    }
    if (addressComp.types.includes('administrative_area_level_1')) {
      administrativeAreaLevel1 = addressComp.short_name;
    }
  });

  let locationName = `${locality}, ${administrativeAreaLevel1}`;
  if (!locality) {
    locationName = result.formatted_address;
  }
  return locationName;
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
    preciseLocation: profileSnap.get('d.coordinates'),
  };
  // Add action to batch for setting private user
  batch.set(db.doc(`users/${profileSnap.id}`), privateUser, {
    merge: true,
  });

  // Get General location name from precise lat/long
  const { latitude, longitude } = profileSnap.get('d.coordinates');
  const generalLocationName = await getLocationNameFromLatLong(
    latitude,
    longitude,
  );

  // Build public user profile (GeoFirestore format)
  const publicUser = {
    d: {
      firstName: profileSnap.get('d.firstName'),
      displayName: profileSnap.get('d.displayName'),
      coordinates: scrambleLocation(profileSnap.get('d.coordinates'), 300),
      generalLocationName,
    },
    // TODO: Look into if g/l should be changed to be generalized or if they were already
    g: profileSnap.get('g'),
    l: profileSnap.get('l'),
  };
  // Add action to batch for setting public user
  batch.set(db.doc(`users_public/${profileSnap.id}`), publicUser, {
    merge: true,
  });

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
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
  });
  console.log('Converting to new data format...');
  try {
    // Convert needs -> requests, requests_public, requests_contact
    await convertRequests();
    // Convert userProfiles -> users, users_privileged, users_public
    await convertUsers();
    console.log(`Successfully converted Firestore data to new format`);
  } catch (err) {
    console.log('error', err);
    console.log(`Error uploading mail templates: ${err.message}`);
    throw err;
  }
}

(async function runTemplatesUpdate() {
  try {
    // Upload all email templates
    await migrateToNewFormat();
    process.exit(0);
  } catch (err) {
    console.log(`Error uploading mail templates: ${err.message}`);
    process.exit(1);
  }
})();
