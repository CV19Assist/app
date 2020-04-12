import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 *
 * @param {admin.firestore.DataSnapshot} snap - Data snapshot of the event
 * @param {Function} snap.data - Value of document
 * @param {functions.EventContext} context - Function event context
 * @param {object} context.auth - Authentication information for the user that triggered the function
 * @returns {Promise} Results of request event create
 */
async function requestCreatedEvent(snap, context) {
  const { params } = context;
  // const { params, auth, timestamp } = context;
  console.log('requestCreated onCreate event:', snap.data(), { params });
  // const requestData = snap.data()
  // Create Firestore Collection Reference for the response
  // const collectionRef = admin.database().ref('requests/sendFcm')
  // TODO: Notifiy all users in system_settings document

  try {
    // Write data to Firestore
    // await collectionRef.push({ userId: requestData.createdBy, message: '' });
  } catch (writeErr) {
    // Handle errors writing data to RTDB
    console.error(
      `Error writing response: ${writeErr.message || ''}`,
      writeErr,
    );
    throw writeErr;
  }

  // End function execution by returning
  return null;
}

/**
 * Cloud Function triggered by Firestore Event
 * @name requestCreated
 * @type {functions.CloudFunction}
 */
export default functions.firestore
  .document('requests/{docId}')
  .onCreate(requestCreatedEvent);
