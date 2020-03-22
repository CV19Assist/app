import firebase from 'firebase/app';
import 'firebase/analytics';
import 'firebase/functions';
import 'firebase/auth';

// Your web app's Firebase configuration
let firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  // storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
// const db = firebase.firestore();
const firebaseAuth = firebase.auth();

// // TODO: Is this still needed?
// class FirebaseHelper {
//   constructor() {
//     this.API_URL = process.env.API_URL;
//   }
// };

// const firebaseHelper = new FirebaseHelper();

export { firebase, firebaseAuth };