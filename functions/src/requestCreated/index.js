import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { PubSub } from '@google-cloud/pubsub';
import { to } from 'utils/async';

// Creates a client; cache this for further use
const pubSubClient = new PubSub();

/**
 * @param userId
 */
async function sendFcmToUser(userId) {
  const messageObject = { userId, message: 'Request Created' };
  const messageBuffer = Buffer.from(JSON.stringify(messageObject));
  try {
    const messageId = await pubSubClient
      .topic('sendFcm')
      .publish(messageBuffer);
    console.log(
      `Sent request for FCM message to user ${userId}, messageid: ${messageId}`,
    );
    return messageId;
  } catch (err) {
    console.error(
      `Error requesting FCM message send to user ${userId}: ${err.message}`,
    );
    throw err;
  }
}
/**
 * Send FCM messages to users by calling sendFcm cloud function
 * @param userUids - Uids of users for which to send messages
 */
async function sendFcms(userUids) {
  const [writeErr] = await to(Promise.all(userUids.map(sendFcmToUser)));
  // Handle errors writing messages to send notifications
  if (writeErr) {
    console.error(`Error requesting FCMs: ${writeErr.message || ''}`, writeErr);
    throw writeErr;
  }
}

/**
 * Send messages for every new request that is created based on settings
 * in system_settings/notification document in Firestore
 * @param {admin.firestore.DataSnapshot} snap - Data snapshot of the event
 * @param {Function} snap.data - Value of document
 * @param {functions.EventContext} context - Function event context
 * @param {object} context.auth - Authentication information for the user that triggered the function
 * @returns {Promise} Results of request event create
 */
async function requestCreatedEvent(snap, context) {
  const { params } = context;
  const requestData = snap.data();
  console.log('requestCreated onCreate event:', requestData, { params });

  // Load settings doc
  const settingsRef = admin.firestore().doc('system_settings/notifications');
  const [settingsDocErr, settingsDocSnap] = await to(settingsRef.get());

  // Handle errors loading settings docs
  if (settingsDocErr) {
    console.error(
      `Error loading settings doc: ${settingsDocErr.message || ''}`,
      settingsDocErr,
    );
  }

  // Notify all users in newRequests parameter of system_settings/notification document
  const { newRequests: userUids } = settingsDocSnap.data() || {};
  await sendFcms(userUids);

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
