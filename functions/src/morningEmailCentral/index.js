import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { to } from 'utils/async';

/**
 *
 * @param {functions.EventContext} context - Function event context
 * @param {object} context.auth - Authentication information for the user that triggered the function
 * @returns {Promise} Resolves after handling event
 */
async function morningEmailCentralTzEvent(context) {
  const { timestamp } = context;
  console.log('This will be run every day at 9:00 AM Central!');

  // Create RTDB for response
  const mailRef = admin.firestore().collection('mail');

  // Query for unclaimed requests
  const [requestsErr, unclaimedRequestsSnap] = await to(
    admin.firestore().collection('requests').where('status', '<', 10).get(),
  );

  // Handle errors querying for unclaimed requests
  if (requestsErr) {
    console.error(
      `Error requests which have not been claimed: ${requestsErr.message}`,
    );
    throw requestsErr;
  }

  // Map doc snaps into an array of doc values
  const unclaimedRequests = unclaimedRequestsSnap.docs.map((docSnap) => {
    return {
      id: docSnap.id,
      ...docSnap.data(),
    };
  });

  // Load notification settings
  const notificationsSettingsRef = admin
    .firestore()
    .doc('system_settings/notification');
  const [settingsErr, notificationsSettingsSnap] = await to(
    notificationsSettingsRef.get(),
  );

  // Handle errors getting settings
  if (settingsErr) {
    console.error(
      `Error getting notifications settings from system_settings collection: ${settingsErr.message}`,
    );
    throw settingsErr;
  }

  // Get list of UIDs to email based on notifications settings doc
  // TODO: Email volunteers within proximity instead of all within system_settings/notifications doc
  const toUids = notificationsSettingsSnap.get('morningEmail');
  const [sendMailRequestsErr] = await to(
    mailRef.add({
      toUids,
      template: {
        name: 'morning-unclaimed',
        data: {
          unclaimedRequests,
          timestamp,
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
 * Cloud Function that is called every time new data is created in Firebase Realtime Database.
 *
 * Trigger: `RTDB - onCreate - '/requests/morningEmailCentralTz/{pushId}'`
 * @name morningEmailCentralTz
 * @type {functions.CloudFunction}
 */
export default functions.pubsub
  .schedule('0 9 * * *')
  .timeZone('US/Central') // Central Timezone
  .onRun(morningEmailCentralTzEvent);
