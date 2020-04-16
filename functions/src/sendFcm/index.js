import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { get } from 'lodash';
import { to } from 'utils/async';

/**
 * Parse message body from message into JSON handling errors
 * @param {functions.pubsub.Message} message - Message object from pubsub containing json
 * parameter with body of message
 * @returns {object} Parsed message body
 */
function parseMessageBody(message) {
  try {
    return message.json;
  } catch (e) {
    console.error('PubSub message was not JSON and an error was thrown: ', e);
    return null;
  }
}

/**
 * @param {functions.pubsub.Message} pubsubMessage - Message from pubsub onPublish event
 * @param {functions.Context} context - Functions context
 * @returns {Promise} Results of send event
 */
async function sendFcmEvent(pubsubMessage, context) {
  // Get attributes from message
  const { attributes } = pubsubMessage || {};
  // Parse message body from message into JSON
  const messageBody = parseMessageBody(pubsubMessage);
  console.log('Pub Sub message: ', { messageBody, attributes, context });

  // Handle message not having a body
  if (!messageBody) {
    const noBodyMsg = 'The message does not have a body';
    console.error(noBodyMsg);
    throw new Error(noBodyMsg);
  }

  const { userId, message = '', title = 'CV19Assist' } = messageBody;

  console.log(`FCM request received for: ${userId}`);

  if (!userId) {
    const missingUserIdErr = 'userId is required to send FCM message';
    console.error(missingUserIdErr);
    throw new Error(missingUserIdErr);
  }

  // Get user profile
  const [getProfileErr, userProfileSnap] = await to(
    admin.firestore().doc(`users/${userId}`).get(),
  );

  // Handle errors getting user profile
  if (getProfileErr) {
    console.error('Error getting user profile: ', getProfileErr);
    throw getProfileErr;
  }

  // Get messaging token from user's profile
  const token = get(userProfileSnap.data(), 'messaging.mostRecentToken');

  // Handle messaging token not being found on user object
  if (!token) {
    const missingTokenMsg = `Messaging token not found for uid: "${userId}"`;
    console.error(missingTokenMsg);
    throw new Error(missingTokenMsg);
  }

  console.log(`Token found for user "${userId}", sending message`);

  // Send FCM message to client
  const [sendMessageErr] = await to(
    admin.messaging().send({
      token,
      notification: {
        title,
        body: message,
      },
    }),
  );

  // Handle errors sending FCM message
  if (sendMessageErr) {
    console.error(
      `Error writing response: ${sendMessageErr.message || ''}`,
      sendMessageErr,
    );
    throw sendMessageErr;
  }

  const userAlertsRef = admin.firestore().collection('user_alerts');

  // Write to user_alerts collection
  const [writeErr] = await to(
    userAlertsRef.add({
      userId,
      message,
      title,
      read: false,
    }),
  );

  // Handle errors writing response of sendFcm to RTDB
  if (writeErr) {
    console.error(
      `Error writing response to RTDB: ${writeErr.message || ''}`,
      writeErr,
    );
    throw writeErr;
  }

  return null;
}

/**
 * Cloud Function triggered by a PubSub message publish
 *
 * Trigger: `PubSub - onPublish`
 * @name sendFcm
 * @type {functions.CloudFunction}
 */
export default functions.pubsub.topic('sendFcm').onPublish(sendFcmEvent);
