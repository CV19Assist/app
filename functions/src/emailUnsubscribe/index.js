import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { USERS_COLLECTION } from 'constants/firestorePaths';
import { to } from 'utils/async';

/**
 * Handle request from calling /emailUnsubscribe endpoint
 * @param {object} req - Express HTTP Request
 * @param {object} res - Express HTTP Response
 * @returns {Promise} Resolves after handling request
 */
async function emailUnsubscribeRequest(req, res) {
  // Write response to request to end function execution
  const { body, query } = req;
  console.log('Unsubscribe request received', { body, query });
  if (!query) {
    console.error('Query parameters not included no request, exiting');
    return res.status(500).send('Error');
  }
  const { email } = req.query;
  console.log(`Loading account for user with email: ${to}`);

  // Get user account to confirm it exists
  const [userGetErr, usersSnaps] = await to(
    // NOTE: We could in theory use admin.auth().getUserByEmail(email) since we update the auth email
    // in the account page. Using database is easier for tests since auth emulation is not yet supported
    admin
      .firestore()
      .collection(USERS_COLLECTION)
      .where('email', '==', email)
      .limit(1)
      .get(),
  );

  // Exit if there is an error getting the user account
  if (userGetErr) {
    console.error(`Error getting user account for email: ${email}`, userGetErr);
    return res.status(500).send('Error');
  }

  // Exit if user account not found with matching email
  if (!usersSnaps.docs.length) {
    console.error(`User not found for email: ${email}`);
    return res.status(500).send('Error');
  }

  // Select first user (since we limited to 1 in our query)
  const [userSnap] = usersSnaps.docs;

  // Disable email notifications on the user's account
  const [updateErr] = await to(
    userSnap.ref.update({ emailNotifications: false }),
  );

  // Handle errors updating user account
  if (updateErr) {
    console.error(
      `Error updating user account for with UID: ${userSnap.id}:`,
      updateErr.message,
    );
    return res.status(500).send('Error');
  }

  // Respond with success
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  // TODO: Look into if we should respond with a thank you email or redirect
  res.end('You have been successfully unsubscribed, thank you!');
  return null;
}

/**
 * @name emailUnsubscribe
 * Cloud Function triggered by HTTP request
 * @type {functions.CloudFunction}
 */
export default functions.https.onRequest(emailUnsubscribeRequest);
