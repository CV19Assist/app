import React from 'react';
import PropTypes from 'prop-types';
import GoogleButton from 'react-google-button';
import { makeStyles } from '@material-ui/core/styles';
import useNotifications from 'modules/notification/useNotifications';
import firebase from 'firebase/app'; // imported for auth provider
import { useAuth } from 'reactfire';
import styles from './GoogleSignIn.styles';

const useStyles = makeStyles(styles);

function GoogleSignIn({ label, handleClick }) {
  const classes = useStyles();
  const auth = useAuth();
  const { showError } = useNotifications();

  async function googleLogin(handleSignIn) {
    const provider = new firebase.auth.GoogleAuthProvider();
    const isMobile = /iPhone|iPad|iPod|Android/i.test(
      window.navigator.userAgent,
    );
    const signInMethod = isMobile ? 'signInWithRedirect' : 'signInWithPopup';
    try {
      const authState = await auth[signInMethod](provider);
      // Write user profile if it doesn't exist, otherwise redirect to search page
      await handleSignIn(authState);
    } catch (err) {
      showError(err.message);
    }
  }

  return (
    <>
      <div className={classes.orLabel}>or</div>
      <div className={classes.providers}>
        <GoogleButton
          label={label}
          onClick={() => {
            googleLogin(handleClick);
          }}
          data-test="google-auth-button"
        />
      </div>
    </>
  );
}

GoogleSignIn.propTypes = {
  label: PropTypes.string,
  handleClick: PropTypes.func,
};

export default GoogleSignIn;
