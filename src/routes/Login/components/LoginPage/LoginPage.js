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

  auth.onAuthStateChanged((authState) => {
    if (authState) {
      const { email, displayName, photoURL, providerData } = authState;
      const newProfile = { email, displayName, photoURL };
      if (providerData && providerData.length) {
        newProfile.providerData = [{ ...providerData[0] }];
      }
      // Write user profile if it doesn't exist, otherwise redirect to search page
      firestore
        .doc(`${USERS_COLLECTION}/${authState.uid}`)
        .get()
        // eslint-disable-next-line consistent-return
        .then((userSnap) => {
          if (!userSnap.exists) {
            return userSnap.ref.set(newProfile, { merge: true }).then(() => {
              history.replace(NEW_USER_PATH);
            });
          }
          history.replace(SEARCH_PATH);
        });
    }
  });

  function googleLogin() {
    setLoadingState(true);
    const provider = new firebase.auth.GoogleAuthProvider();
    const isMobile = /iPhone|iPad|iPod|Android/i.test(
      window.navigator.userAgent,
    );
    // Use redirect on mobile
    if (isMobile) {
      return auth.signInWithRedirect(provider).catch((err) => {
        setLoadingState(false);
        showError(err.message);
      });
    }
    return auth.signInWithPopup(provider).catch((err) => {
      setLoadingState(false);
      showError(err.message);
    });
  }

  return (
    <div className={classes.root}>
      <Paper className={classes.panel}>
        {isLoading ? <LoadingSpinner /> : <LoginForm />}
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
