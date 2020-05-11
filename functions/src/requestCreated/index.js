import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { PubSub } from '@google-cloud/pubsub';
import { GeoFirestore } from 'geofirestore';
import { to } from 'utils/async';
import {
  REQUESTS_COLLECTION,
  MAIL_COLLECTION,
  USERS_PUBLIC_COLLECTION,
  USERS_COLLECTION,
} from 'constants/firestorePaths';
import { getFirebaseConfig, getEnvConfig } from 'utils/firebaseFunctions';

// Creates a client; cache this for further use
const pubSubClient = new PubSub();

/**
 * Send FCM message to user about request being created
 * @param {string} userId - Id of user to send FCM message
 * @returns {Promise} Resolves with message id
 */
async function sendFcmToUser(userId) {
  const messageObject = { userId, message: 'Request Created' };
  const messageBuffer = Buffer.from(JSON.stringify(messageObject));
  try {
    const messageId = await pubSubClient
      .topic('sendFcm')
      .publish(messageBuffer);

    console.log(
      `Sent request for FCM message to user ${userId}, messageId: ${messageId}`,
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
 * @param {Array} userUids - Uids of users for which to send messages
 * @returns {Promise} Resolves with array of results from sending fcms
 */
async function sendFcms(userUids) {
  const [writeErr] = await to(Promise.all(userUids.map(sendFcmToUser)));
  // Handle errors writing messages to send notifications
  if (writeErr) {
    console.error(`Error requesting FCMs: ${writeErr.message || ''}`, writeErr);
    throw writeErr;
  }
}

const KM_TO_MILES = 1.609344;

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
  const requestData = snap.data();
  const { requestId } = context.params;
  console.log('requestCreated onCreate event:', requestData, { requestId });
  const { preciseLocation } = requestData;

  // Exit if precise location is not on request object
  if (!preciseLocation) {
    console.error(`Precise location not found on request with id ${requestId}`);
    return null;
  }

  console.log('Precise location of request', preciseLocation);

  // Query user public accounts within 60 miles of the request
  const searchDistance = 60;
  const geofirestore = new GeoFirestore(admin.firestore());
  const [nearbyUsersErr, nearbyUsersSnaps] = await to(
    geofirestore
      .collection(USERS_PUBLIC_COLLECTION)
      .near({
        /* eslint-disable no-underscore-dangle */
        center: new admin.firestore.GeoPoint(
          preciseLocation.latitude,
          preciseLocation.longitude,
        ),
        /* eslint-enable no-underscore-dangle */
        radius: KM_TO_MILES * searchDistance,
      })
      // Limit was causing issue
      // .limit(50)
      .get(),
  );

  if (nearbyUsersErr) {
    console.error(
      `Error querying for nearby users for request "${requestId}":`,
      nearbyUsersErr.message,
    );
    throw nearbyUsersErr;
  }

  console.log(
    `Nearby user results for request "${requestId}":`,
    nearbyUsersSnaps.docs.map((nearbyUserDoc) => nearbyUserDoc.id),
  );

  // Exit if no users found nearby
  // TODO: Discuss switching this searching again within a bigger radius
  if (!nearbyUsersSnaps.docs.length) {
    console.log('No nearby users found, exiting');
    return null;
  }

  // Load user accounts of nearby users (to check notification settings)
  // TODO: Look into if a where with ids and notification settings performs better
  const nearbyUsersAccountSnaps = await Promise.all(
    nearbyUsersSnaps.docs.map((userSnap) =>
      admin.firestore().doc(`${USERS_COLLECTION}/${userSnap.id}`).get(),
    ),
  );
  console.log('Nearby users accounts loaded:', nearbyUsersAccountSnaps.length);
  console.log(
    `Nearby user accounts for request "${requestId}":`,
    nearbyUsersAccountSnaps.map((nearbyUserDoc) => nearbyUserDoc.data()),
  );
  // Filter nearby users into ids of users with emails or browser notifications enabled
  const { browserNotifUids, emailNotifUids } = nearbyUsersAccountSnaps.reduce(
    (acc, userDocSnap) => {
      // Browser notifications to users which have browser notifications enabled
      if (userDocSnap.get('browserNotifications')) {
        acc.browserNotifUids.push(userDocSnap.id);
      }
      // Email notifications to users which have super-admin role
      if (userDocSnap.get('role') === 'super-admin') {
        acc.emailNotifUids.push(userDocSnap.id);
      }
      return acc;
    },
    {
      browserNotifUids: [],
      emailNotifUids: [],
    },
  );
  console.log('Notification settings:', {
    browserNotifUids,
    emailNotifUids,
  });

  // Exit if none of the users within range have notifications enabled
  if (!browserNotifUids.length && !emailNotifUids.length) {
    console.log('No users have browser notifications enabled. Exiting...');
    return null;
  }

  // Send FCMs to all of the nearby users with browser notification setting enabled
  await sendFcms(browserNotifUids);

  const projectId = getFirebaseConfig('projectId');
  // Set domain as frontend url if set, otherwise fallback to Firebase Hosting URL
  const projectDomain = getEnvConfig('frontend.url', `${projectId}.web.app`);
  // Send emails to users with email enabled
  const [sendMailRequestsErr] = await to(
    admin
      .firestore()
      .collection(MAIL_COLLECTION)
      .add({
        toUids: emailNotifUids,
        template: {
          name: 'new-request',
          data: {
            requestData: {
              ...requestData,
              id: requestId,
            },
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

  // End function execution by returning
  return null;
}

/**
 * Cloud Function triggered by Firestore Event
 * @name requestCreated
 * @type {functions.CloudFunction}
 */
export default functions.firestore
  .document(`${REQUESTS_COLLECTION}/{requestId}`)
  .onCreate(requestCreatedEvent);
