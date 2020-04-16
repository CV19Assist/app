import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { to } from 'utils/async';
import {
  NOTIFICATIONS_SETTINGS_DOC,
  MAIL_COLLECTION,
  REQUESTS_PUBLIC_COLLECTION,
} from 'constants/firestorePaths';

/**
 *
 * @param {functions.EventContext} context - Function event context
 * @param {object} context.auth - Authentication information for the user that triggered the function
 * @returns {Promise} Resolves after handling event
 */
async function morningEmailCentralEvent(context) {
  const { timestamp } = context;
  console.log('This will be run every day at 9:00 AM Central!');

  // Query for unclaimed requests
  const [requestsErr, unclaimedRequestsSnap] = await to(
    admin
      .firestore()
      .collection(REQUESTS_PUBLIC_COLLECTION)
      .where('d.status', '<', 10)
      .get(),
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
  const [settingsErr, notificationsSettingsSnap] = await to(
    admin.firestore().doc(NOTIFICATIONS_SETTINGS_DOC).get(),
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

  // Create RTDB for response
  const [sendMailRequestsErr] = await to(
    admin
      .firestore()
      .collection(MAIL_COLLECTION)
      .add({
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
 * Cloud Function that is called every 9AM in central timezone
 *
 * Trigger: `PubSub - onPublish - 0 9 * * *`
 * @name morningEmailCentral
 * @type {functions.CloudFunction}
 */
export default functions.pubsub
  .schedule('0 9 * * *')
  .timeZone('US/Central') // Central Timezone
  .onRun(morningEmailCentralEvent);
