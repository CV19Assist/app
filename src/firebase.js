import firebase from 'firebase/app';
import 'firebase/analytics';
import 'firebase/firestore';
import 'firebase/auth';

// Your web app's Firebase configuration
let firebaseConfig = {
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
export const db = firebase.firestore();
export const firebaseAuth = firebase.auth();
export { firebase };