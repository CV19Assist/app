import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import firebase from 'firebase/app'; // imported for auth provider
import { useAuth, useFirestore } from 'reactfire';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import GoogleButton from 'react-google-button';
import { NEW_USER_PATH, SEARCH_PATH } from 'constants/paths';
import { USERS_COLLECTION } from 'constants/collections';
import useNotifications from 'modules/notification/useNotifications';
import LoadingSpinner from 'components/LoadingSpinner';
import LoginForm from '../LoginForm';
import styles from './LoginPage.styles';

const useStyles = makeStyles(styles);

function LoginPage() {
  const classes = useStyles();
  const auth = useAuth();
  const history = useHistory();
  const firestore = useFirestore();
  const [isLoading, setLoadingState] = useState(false);
  const { showError } = useNotifications();

  async function updateUserAndRedirect(authState) {
    try {
      // Write user profile if it doesn't exist, otherwise redirect to search page
      const userSnap = await firestore
        .doc(`${USERS_COLLECTION}/${authState.user.uid}`)
        .get();
      // Redirect to search page if user exists
      if (userSnap.exists) {
        history.replace(SEARCH_PATH);
      } else {
        // Write user object then redirect to new user page
        const { email, displayName, photoURL, providerData } = authState.user;
        const newProfile = { email, displayName, photoURL };
        if (providerData && providerData.length) {
          newProfile.providerData = [{ ...providerData[0] }];
        }
        await userSnap.ref.set(newProfile, { merge: true });
        history.replace(NEW_USER_PATH);
      }
    } catch (err) {
      setLoadingState(false);
      showError(err.message);
    }
  }

  async function googleLogin() {
    setLoadingState(true);
    const provider = new firebase.auth.GoogleAuthProvider();
    const isMobile = /iPhone|iPad|iPod|Android/i.test(
      window.navigator.userAgent,
    );
    const signInMethod = isMobile ? 'signInWithRedirect' : 'signInWithPopup';
    try {
      const authState = await auth[signInMethod](provider);
      // Write user profile if it doesn't exist, otherwise redirect to search page
      await updateUserAndRedirect(authState);
    } catch (err) {
      setLoadingState(false);
      showError(err.message);
    }
  }

  async function emailLogin(creds) {
    try {
      const authState = await auth.signInWithEmailAndPassword(
        creds.email,
        creds.password,
      );
      // Write user profile if it doesn't exist, otherwise redirect to search page
      await updateUserAndRedirect(authState);
    } catch (err) {
      showError(err.message);
    }
  }

  return (
    <div className={classes.root}>
      <Paper className={classes.panel}>
        {isLoading ? <LoadingSpinner /> : <LoginForm onSubmit={emailLogin} />}
      </Paper>
      {isLoading ? null : (
        <>
          <div className={classes.orLabel}>or</div>
          <div className={classes.providers}>
            <GoogleButton
              onClick={googleLogin}
              data-test="google-auth-button"
            />
          </div>
        </>
      )}
    </div>
  );
}

export default LoginPage;
