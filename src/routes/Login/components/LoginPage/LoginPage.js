import React from 'react';
import { useHistory } from 'react-router-dom';
import firebase from 'firebase/app'; // imported for auth provider
import { useAuth, useFirestore } from 'reactfire';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import GoogleButton from 'react-google-button';
import { NEW_USER_PATH, SEARCH_PATH } from 'constants/paths';
import { USERS_COLLECTION } from 'constants/collections';
import useNotifications from 'modules/notification/useNotifications';
import LoginForm from '../LoginForm';
import styles from './LoginPage.styles';

const useStyles = makeStyles(styles);

function LoginPage() {
  const classes = useStyles();
  const auth = useAuth();
  const history = useHistory();
  const firestore = useFirestore();
  const { showError } = useNotifications();

  auth.onAuthStateChanged((authState) => {
    if (authState) {
      const { email, displayName, photoURL, providerData } = authState;
      const newProfile = { email, displayName, photoURL };
      if (providerData && providerData.length) {
        newProfile.providerData = providerData;
      }
      // Write user profile if it doesn't exist, otherwise redirect to search page
      firestore
        .doc(`${USERS_COLLECTION}/${authState.uid}`)
        .get()
        // eslint-disable-next-line consistent-return
        .then((userSnap) => {
          if (!userSnap.exists) {
            return userSnap.ref.set(newProfile, { merge: true });
          }
          history.replace(SEARCH_PATH);
        })
        .then(() => {
          history.replace(NEW_USER_PATH);
        });
    }
  });

  function googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    return auth
      .signInWithPopup(provider)
      .catch((err) => showError(err.message));
  }

  return (
    <div className={classes.root}>
      <Paper className={classes.panel}>
        <LoginForm />
      </Paper>
      <div className={classes.orLabel}>or</div>
      <div className={classes.providers}>
        <GoogleButton onClick={googleLogin} data-test="google-auth-button" />
      </div>
    </div>
  );
}

export default LoginPage;
