import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';
import 'firebase/firestore';
import { attachCustomCommands } from 'cypress-firebase';

const projectId =
  Cypress.env('GCLOUD_PROJECT') || Cypress.env('FIREBASE_PROJECT_ID');

const fbConfig = {
  apiKey: Cypress.env('FIREBASE_API_KEY'),
  authDomain: `${projectId}.firebaseapp.com`,
  databaseURL:
    Cypress.env('FB_databaseURL') || `https://${projectId}.firebaseio.com`,
  projectId: `${projectId}`,
  storageBucket: `${projectId}.appspot.com`,
};

firebase.initializeApp(fbConfig);

// Custom commands including login, signup, callRtdb, and callFirestore
attachCustomCommands({ Cypress, cy, firebase });
