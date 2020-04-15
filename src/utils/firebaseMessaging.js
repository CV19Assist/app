import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/messaging';

/**
 * Write FCM messagingToken to user profile
 * @param {String} messagingToken - Token to be written to user profile
 */
function updateUserProfileWithToken(messagingToken) {
  const currentUserUid =
    firebase.auth().currentUser && firebase.auth().currentUser.uid;
  if (!currentUserUid) {
    return Promise.resolve();
  }
  return firebase
    .firestore()
    .collection('users')
    .doc(currentUserUid)
    .set(
      {
        messaging: {
          mostRecentToken: messagingToken,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        },
      },
      { merge: true },
    )
    .catch((err) => {
      /* eslint-disable no-console */
      console.error(
        'Error updating user profile with messaging token:',
        err.message,
      );
      /* eslint-enable no-console */
      return Promise.reject(err);
    });
}

/**
 * Get Cloud Messaging Token from Firebase messaging
 * and write it to the currently logged in user's profile
 */
function getTokenAndWriteToProfile() {
  return firebase
    .messaging()
    .getToken()
    .then(updateUserProfileWithToken)
    .catch((err) => {
      console.error('Unable to get token and write to profile', err); // eslint-disable-line no-console
      return Promise.reject(err);
    });
}

let messagingInitialized = false;

/**
 * Setup Firebase Cloud Messaging. This  requests permission from the
 * user to show browser notifications. If the user approves or if they have
 * approved in the passed, then a Cloud Messaging Token is written to the
 * user's profile.
 */
export default function initializeMessaging({ showSuccess }) {
  // Exit if browser does not support messaging
  if (!firebase.messaging.isSupported()) {
    /* eslint-disable no-console */
    console.warn(
      'Skipping messaging initialization, browser does not support FCM',
    );
    /* eslint-enable no-console */
    return;
  }

  // Exit if public vapid key is not set
  if (!process.env.REACT_APP_FIREBASE_PUBLIC_VAPID_KEY) {
    /* eslint-disable no-console */
    console.warn(
      'Skipping messaging initialization, REACT_APP_FIREBASE_PUBLIC_VAPID_KEY not set in environment',
    );
    /* eslint-enable no-console */
    return;
  }
  if (messagingInitialized) {
    return;
  }
  const messaging = firebase.messaging();

  messaging.usePublicVapidKey(process.env.REACT_APP_FIREBASE_PUBLIC_VAPID_KEY);

  // Handle Instance ID token updates
  messaging.onTokenRefresh(() => {
    getTokenAndWriteToProfile();
  });
  messagingInitialized = true;
  // Handle incoming messages. Called when:
  // - a message is received while the app has focus
  // - the user clicks on an app notification created by a service worker
  //   `messaging.setBackgroundMessageHandler` handler.
  messaging.onMessage((payload) => {
    // TODO: Wire up notification
    console.log('Message', payload); // eslint-disable-line no-console
    showSuccess(payload);
  });

  // Request permission to setup browser notifications
  firebase
    .messaging()
    .requestPermission()
    .then(getTokenAndWriteToProfile)
    .catch((err) => {
      console.error('Unable to get permission to notify: ', err); // eslint-disable-line no-console
      return Promise.reject(err);
    });
}
