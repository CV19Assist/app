// Import and configure the Firebase SDK
// These scripts are made available when the app is served or deployed on Firebase Hosting
// If you do not serve/host your project using Firebase Hosting see https://firebase.google.com/docs/web/setup
importScripts('https://www.gstatic.com/firebasejs/7.14.0/firebase-app.js');
importScripts(
  'https://www.gstatic.com/firebasejs/7.14.0/firebase-messaging.js',
);

const prodConfig = {
  apiKey: 'AIzaSyAwxqcKSQzLALz3mca5z95NpQ5u5tdBUpQ',
  authDomain: 'cv19assist-bfa5f.firebaseapp.com',
  databaseURL: 'https://cv19assist-bfa5f.firebaseio.com',
  projectId: 'cv19assist-bfa5f',
  storageBucket: 'cv19assist-bfa5f.appspot.com',
  messagingSenderId: '286751889445',
  appId: '1:286751889445:web:93cdb64dca219c5bc987cc',
  measurementId: 'G-GN6WEKL6EZ',
};

const stageConfig = {
  apiKey: 'AIzaSyBFT5yhCTqcjuJB5BgmOcC52vD_gTmcqr4',
  authDomain: 'cv19assist-dev.firebaseapp.com',
  databaseURL: 'https://cv19assist-dev.firebaseio.com',
  projectId: 'cv19assist-dev',
  storageBucket: 'cv19assist-dev.appspot.com',
  messagingSenderId: '487252002912',
  appId: '1:487252002912:web:53e28d338ebd8788215b05',
  measurementId: 'G-GB8SL2LGL0',
};

const nextConfig = {
  apiKey: 'AIzaSyBowgXC55EjPKY46v04jH-crZlH_zCaepU',
  authDomain: 'cv19assist-next.firebaseapp.com',
  databaseURL: 'https://cv19assist-next.firebaseio.com',
  projectId: 'cv19assist-next',
  storageBucket: 'cv19assist-next.appspot.com',
  messagingSenderId: '971141009068',
  appId: '1:971141009068:web:6d7a40c5742c1c21ac5909',
  measurementId: 'G-WWBQXP76C2',
};

let fbConfig;

if (self.location.hostname.startsWith('cv19assist-dev')) {
  fbConfig = stageConfig;
} else if (self.location.hostname.startsWith('cv19assist-next')) {
  fbConfig = nextConfig;
} else {
  fbConfig = prodConfig;
}

firebase.initializeApp(fbConfig);

const messaging = firebase.messaging();

// Custom background message handler
messaging.setBackgroundMessageHandler(function messageHandler(payload) {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload,
  );

  // Customize default notification here
  const notificationTitle = 'CV19Assist';
  const notificationOptions = {
    body: payload,
    icon: '/CV19AssistLogo.png',
  };

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions,
  );
});
