// Import and configure the Firebase SDK
// These scripts are made available when the app is served or deployed on Firebase Hosting
// If you do not serve/host your project using Firebase Hosting see https://firebase.google.com/docs/web/setup
importScripts('https://www.gstatic.com/firebasejs/7.3.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.3.0/firebase-messaging.js');

const PROD_MESSAGING_ID = '286751889445';
const STAGE_MESSAGING_ID = '487252002912';

/* eslint-disable prettier/prettier */
firebase.initializeApp({
  // Use prod id if stage id not defined or running on prod Firebase hosting
  messagingSenderId: !STAGE_MESSAGING_ID || self.location.hostname.includes('cv19assist-dev') // eslint-disable-line no-undef
    ? PROD_MESSAGING_ID
    : STAGE_MESSAGING_ID
})
/* eslint-disable prettier/prettier */

const messaging = firebase.messaging()

// Custom background message handler
messaging.setBackgroundMessageHandler(function messageHandler(payload) {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload
  )
  
  // Customize default notification here
  const notificationTitle = 'App'
  const notificationOptions = {
    body: 'Background Message body.',
    icon: '/firebase-logo.png'
  }

  return self.registration.showNotification( // eslint-disable-line no-undef
    notificationTitle,
    notificationOptions
  )
})