import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import firebase from 'firebase/app'; // imported for auth provider
import { useAuth, useFirestore } from 'reactfire';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import GoogleButton from 'react-google-button';
import { USER_PROFILE_PATH, SEARCH_PATH } from 'constants/paths';
import { USERS_PUBLIC_COLLECTION } from 'constants/collections';
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
  const { showError, showMessage } = useNotifications();

  async function hasAccount(user) {
    const userSnap = await firestore
      .doc(`${USERS_PUBLIC_COLLECTION}/${user.uid}`)
      .get();
      const data = await userSnap.data();
      console.log("Checking account", data);
      if (!!data && !!data.d && !!data.d.hasAccount) {
          return true;
    }
  return false;
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
      if (await hasAccount(authState.user)) {
        history.replace(SEARCH_PATH);
        return;
      }
      showMessage('You need to finish filling out your profile.');
      history.replace(USER_PROFILE_PATH);
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
      if (await hasAccount(authState.user)) {
        history.replace(SEARCH_PATH);
        return;
      }
      showMessage('You need to finish filling out your profile.');
      history.replace(USER_PROFILE_PATH);
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
