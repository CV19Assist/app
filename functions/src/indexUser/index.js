import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { GeoFirestore } from 'geofirestore';
import { to } from 'utils/async';
import {
  USERS_PUBLIC_COLLECTION,
  USERS_PRIVILEGED_COLLECTION,
  USERS_COLLECTION,
  NOTIFICATIONS_SETTINGS_DOC,
  MAIL_COLLECTION,
} from 'constants/firestorePaths';
import { getFirebaseConfig, getEnvConfig } from 'utils/firebaseFunctions';

/**
 * Sends an email when a new user is created.
 * @param {string} userId - User ID of the new user.
 * @param {object} userData - User document data.
 */
async function sendNewUserEmail(userId, userData) {
  // Load settings doc
  const settingsRef = admin.firestore().doc(NOTIFICATIONS_SETTINGS_DOC);
  const [settingsDocErr, settingsDocSnap] = await to(settingsRef.get());

  // Handle errors loading settings docs
  if (settingsDocErr) {
    console.error(
      `Error loading settings doc: ${settingsDocErr.message || ''}`,
      settingsDocErr,
    );
  }

  const projectId = getFirebaseConfig('projectId');
  // Set domain as frontend url if set, otherwise fallback to Firebase Hosting URL
  const projectDomain = getEnvConfig('frontend.url', `${projectId}.web.app`);

  // Get list of UIDs to email based on notifications settings doc
  const toUids = settingsDocSnap.get('newUser');

  const [sendMailRequestsErr] = await to(
    admin
      .firestore()
      .collection(MAIL_COLLECTION)
      .add({
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        toUids,
        template: {
          name: 'new-user',
          data: {
            userId,
            userData,
            projectDomain,
          },
        },
      }),
  );

  // Handle errors writing requests to send mail
  if (sendMailRequestsErr) {
    console.error(
      `Error writing requests to send email: ${sendMailRequestsErr.message}`,
    );
    throw sendMailRequestsErr;
  }
}

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

  // Only do this for new users.
  if (!change.before.exists) {
    await sendNewUserEmail(userId, newData);
  }

  // Default to 'user' role and do not allow changing role for now.
  if (!previousData || previousData.role !== newData.role) {
    newData.role = 'user';
  }

  try {
    const geofirestore = new GeoFirestore(admin.firestore());
    const geoDoc = {
      firstName: newData.firstName || previousData.firstName || '',
      displayName: newData.displayName || previousData.displayName || '',
      generalLocation:
        newData.generalLocation || previousData.generalLocation || '',
      generalLocationName:
        newData.generalLocationName || previousData.generalLocationName || '',
    };

    // Update displayName within public profile
    await geofirestore
      .collection(USERS_PUBLIC_COLLECTION)
      .doc(userId)
      .set(geoDoc, { customKey: 'generalLocation', merge: true });

    await privilegedProfileRef.set(
      {
        displayName: newData.displayName || '',
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
