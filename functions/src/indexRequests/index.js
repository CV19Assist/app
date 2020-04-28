import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { GeoFirestore } from 'geofirestore';
import {
  REQUESTS_COLLECTION,
  REQUESTS_PUBLIC_COLLECTION,
  REQUESTS_CONTACT_COLLECTION,
  REQUESTS_ACTIONS_COLLECTION,
} from 'constants/firestorePaths';

/**
 * @param  {admin.Change} change - Function change interface containing state objects
 * @param {admin.firestore.DataSnapshot} change.before - State prior to the event.
 * @param {Function} change.before.data - Value before change event
 * @param {admin.firestore.DataSnapshot} change.after - State after the event.
 * @param {Function} change.after.data - Value after change event
 * @param {functions.EventContext} context - Function event context
 * @param {object} context.auth - Authentication information for the user that triggered the function
 * @returns {Promise}
 */
async function indexRequestsEvent(change, context) {
  // const { params, auth, timestamp } = context;
  const {
    params: { requestId },
  } = context;
  const { before, after } = change;
  console.log('indexRequests onWrite event:', {
    requestId,
    before: before.data(),
    after: after.data(),
  });
  const publicRequestRef = admin
    .firestore()
    .doc(`${REQUESTS_COLLECTION}/${requestId}`);
  const requestContactRef = admin
    .firestore()
    .doc(`${REQUESTS_CONTACT_COLLECTION}/${requestId}`);

  // Request is being deleted
  if (!change.after.exists) {
    console.log(
      `Request being removed with id: ${requestId}, removing from index...`,
    );
    try {
      await publicRequestRef.delete();
      await requestContactRef.delete();
    } catch (nameRemoveErr) {
      console.error(
        'Error deleting requests:',
        nameRemoveErr.message || nameRemoveErr,
      );
      throw nameRemoveErr;
    }
    console.log(`Successfully removed user with id: ${requestId} from index.`);
    return null;
  }

  const newData = change.after.data();
  try {
    // Batch request updates to different collection
    const batch = admin.firestore().batch();
    const { lastName, phone, email, ...publicValues } = newData;
    batch.set(publicRequestRef, publicValues, { merge: true });
    const contactData = {
      email: newData.email || '',
      phone: newData.phone || '',
    };
    batch.set(requestContactRef, contactData, { merge: true });

    // Write data to different collections in parallel
    const geofirestore = new GeoFirestore(admin.firestore);
    await Promise.all([
      batch.commit(),
      geofirestore
        .collection(REQUESTS_PUBLIC_COLLECTION)
        .doc(requestId)
        .set(publicValues, { customKey: 'generalLocation' }),
      requestContactRef.set(contactData),
      admin
        .firestore()
        .collection(REQUESTS_ACTIONS_COLLECTION)
        .add({
          requestId,
          kind: 1, // 1-created
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          firstName: newData.firstName || '',
          displayName: newData.displayName,
        }),
    ]);
  } catch (writeErr) {
    console.error(`Error updating requests:`, writeErr.message);
    throw writeErr;
  }

  // End function execution by returning
  return null;
}

/**
 * Cloud Function triggered by Firestore Event
 * @name indexRequests
 * @type {functions.CloudFunction}
 */
export default functions.firestore
  .document(`${REQUESTS_PUBLIC_COLLECTION}/{requestId}`)
  .onWrite(indexRequestsEvent);
