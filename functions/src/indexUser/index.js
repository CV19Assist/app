import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { GeoFirestore } from 'geofirestore';
import {
  USERS_PUBLIC_COLLECTION,
  USERS_PRIVILEGED_COLLECTION,
  USERS_COLLECTION,
} from 'constants/firestorePaths';

/**
 * Index user's by placing their displayName into the users_public collection
 * @param {functions.Change} change - Database event from function being
 * @param {admin.firestore.DataSnapshot} change.before - Snapshot of data before change
 * @param {admin.firestore.DataSnapshot} change.after - Snapshot of data after change
 * @param {functions.EventContext} context - Function context which includes
 * data about the event. More info in docs:
 * https://firebase.google.com/docs/reference/functions/functions.EventContext
 * @returns {Promise} Resolves with user's profile
 */
async function indexUser(change, context) {
  const { userId } = context.params || {};
  const publicProfileRef = admin
    .firestore()
    .doc(`${USERS_PUBLIC_COLLECTION}/${userId}`);

  const privilegedProfileRef = admin
    .firestore()
    .doc(`${USERS_PRIVILEGED_COLLECTION}/${userId}`);

  // User Profile being deleted
  if (!change.after.exists) {
    console.log(
      `Profile being removed for user with id: ${userId}, removing from index...`,
    );
    try {
      await publicProfileRef.delete();
      await privilegedProfileRef.delete();
    } catch (nameRemoveErr) {
      console.error(
        'Error running delete promises:',
        nameRemoveErr.message || nameRemoveErr,
      );
      throw nameRemoveErr;
    }
    console.log(`Successfully removed user with id: ${userId} from index.`);
    return null;
  }

  const previousData = change.before.data();
  const newData = change.after.data();

  // Default to 'user' role and do not allow changing role for now.
  if (!previousData.role || previousData.role !== newData.role) {
    newData.role = 'user';
  }

  try {
    const geofirestore = new GeoFirestore(admin.firestore());
    if (newData.generalLocation) {
      // Update displayName within public profile
      await geofirestore
        .collection(USERS_PUBLIC_COLLECTION)
        .doc(userId)
        .set(
          {
            firstName: newData.firstName || '',
            displayName: newData.displayName || '',
            generalLocation: newData.generalLocation,
            generalLocationName: newData.generalLocationName || '',
          },
          { customKey: 'generalLocation', merge: true },
        );
    }

    await privilegedProfileRef.set(
      {
        displayName: newData.displayName,
        email: newData.email || '',
        firstName: newData.firstName || '',
        lastName: newData.lastName || '',
        address1: newData.address1 || '',
        address2: newData.address2 || '',
        city: newData.city || '',
        state: newData.state || '',
        zipcode: newData.zipcode || '',
        phone: newData.phone || '',
      },
      { merge: true },
    );
  } catch (nameUpdateErr) {
    console.error(
      `Error running updating displayName index for profile with userId: ${userId}`,
      nameUpdateErr.message || nameUpdateErr,
    );
    throw nameUpdateErr;
  }

  return newData;
}

/**
 * Function to index displayName. Triggered by updates to profiles within the
 * users collection. Writes data to "users_public" collection.
 * @type {functions.CloudFunction}
 */
export default functions.firestore
  .document(`/${USERS_COLLECTION}/{userId}`)
  .onWrite(indexUser);
