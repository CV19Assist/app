import * as functions from 'firebase-functions';
// import * as admin from 'firebase-admin';

/**
 * Handle request from calling /emailUnsubscribe endpoint
 * @param {object} req - Express HTTP Request
 * @param {object} res - Express HTTP Response
 * @returns {Promise} Resolves after handling request
 */
async function emailUnsubscribeRequest(req, res) {
  // Write response to request to end function execution
  console.log('Unsubscribe request received', req.body);
  // TODO: Update user settings based on email in request
  // await admin.firestore().collection()
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('You have been successfully unsubscribed, thank you!');
}

/**
 * @name emailUnsubscribe
 * Cloud Function triggered by HTTP request
 * @type {functions.CloudFunction}
 */
export default functions.https.onRequest(emailUnsubscribeRequest);
