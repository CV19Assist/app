import { firebase } from './firebase';

// Configure FirebaseUI.
let AuthUIConfig = {
  // Popup signin flow rather than redirect flow.
  signInFlow: 'popup',
  callbacks: {
      signInSuccessWithAuthResult: () => {
        alert("successful!");
      },
      signInFailure: (error) => {
        alert(error.code);
      }
  },
  // We will display Google and Facebook as auth providers.
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID,

    // To be added later.
    // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
    // firebase.auth.FacebookAuthProvider.PROVIDER_ID,

    // // firebase.auth.PhoneAuthProvider.PROVIDER_ID,
  ],
    //   privacyPolicyUrl: "",
    //   tosUrl: "",
};

// TODO: Handle failure callback.
export const getAuthConfig = (signInSuccessCallback) => {
  AuthUIConfig.callbacks.signInSuccessWithAuthResult = signInSuccessCallback;
  return AuthUIConfig;
};

export const FirebaseAuth = firebase.auth;