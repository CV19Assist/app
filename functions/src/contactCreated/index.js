import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { to } from 'utils/async';

const eventName = 'contactCreated';

/**
 * Emails user's who's UIDs are in the system_settings/notifications
 * @param {admin.firestore.DataSnapshot} snap - Data snapshot of the event
 * @param {Function} snap.data - Value of document
 * @param {functions.EventContext} context - Function event context
 * @param {object} context.auth - Authentication information for the user that triggered the function
 * @returns {Promise} Resolves with null after handling contact creation
 */
async function contactCreatedEvent(snap, context) {
  const { params, auth, timestamp } = context;
  console.log('contactCreated onCreate event:', snap.data());

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
  const { newContacts: userUids } = settingsDocSnap.data() || {};

  // Exit if there are no uids
  if (!userUids) {
    console.log('No user uids found for new contacts, exiting...');
    return null;
  }

  const [getUserEmailErrors, userEmails] = await to(
    Promise.all(
      userUids.map((userId) =>
        admin
          .firestore()
          .doc(`users/${userId}`)
          .get()
          .then((userSnap) => userSnap.data().email || null),
      ),
    ),
  );

  if (getUserEmailErrors) {
    console.error(`Error getting user emails: ${getUserEmailErrors.message}`);
    throw getUserEmailErrors;
  }

  // Create Firestore Collection Reference for the response
  const mailCollection = admin.firestore().collection('mail');

  // Request contact email send to emails from settings collection
  const [writeErr] = await to(
    mailCollection.add({
      to: userEmails,
      template: {
        name: 'contact',
        data: {
          ...(snap.data() || {}),
          params,
          uid: (auth && auth.uid) || null,
          timestamp,
        },
      },
    }),
  );

  if (writeErr) {
    // Handle errors writing data to RTDB
    console.error(
      `Error writing request to send emails: ${writeErr.message || ''}`,
      writeErr,
    );
    throw writeErr;
  }

  // End function execution by returning
  return null;
}

/**
 * Cloud Function triggered by Firestore Event
 * @name contactCreated
 * @type {functions.CloudFunction}
 */
export default functions.firestore
  .document(`${eventName}/{contactId}`)
  .onCreate(contactCreatedEvent);
