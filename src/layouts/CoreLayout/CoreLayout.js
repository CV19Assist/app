import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { SuspenseWithPerf, useFirestore } from 'reactfire';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import TwitterIcon from '@material-ui/icons/Twitter';
import FacebookIcon from '@material-ui/icons/Facebook';
import { makeStyles } from '@material-ui/core/styles';
import NavbarWithoutAuth from 'containers/Navbar/NavbarWithoutAuth';
import Navbar from 'containers/Navbar';
import { Notifications } from 'modules/notification';
import styles from './CoreLayout.styles';
import { version } from '../../../package.json';
import {
  PRIVACY_POLICY_PATH,
  TERMS_OF_SERVICE_PATH,
} from '../../constants/paths';

const useStyles = makeStyles(styles);

function SetupFirestore() {
  const firestore = useFirestore();
  if (process.env.REACT_APP_FIRESTORE_EMULATOR_HOST) {
    const firestoreSettings = {
      host: process.env.REACT_APP_FIRESTORE_EMULATOR_HOST,
      ssl: false,
    };
    if (window.Cypress) {
      // Needed for Firestore support in Cypress (see https://github.com/cypress-io/cypress/issues/6350)
      firestoreSettings.experimentalForceLongPolling = true;
    }

    firestore.settings(firestoreSettings);
    // eslint-disable-next-line no-console
    console.log(
      `Firestore emulator enabled: ${process.env.REACT_APP_FIRESTORE_EMULATOR_HOST}`,
    );
  }
  return null;
}

function CoreLayout({ children }) {
  const classes = useStyles();

  const launchFacebook = () => {
    window.open('https://www.facebook.com/CV19Assist/', '_blank');
  };

  const launchTwitter = () => {
    window.open('https://twitter.com/CV19Assist', '_blank');
  };

  return (
    <div>
      <Notifications />
      <SuspenseWithPerf traceId="setup-firestore">
        <SetupFirestore />
      </SuspenseWithPerf>
      <SuspenseWithPerf fallback={<NavbarWithoutAuth />} traceId="load-navbar">
        <Navbar />
      </SuspenseWithPerf>
      {children}
      <footer className={classes.footer}>
        <IconButton
          component="div"
          className={classes.socialButtons}
          onClick={launchTwitter}>
          <TwitterIcon color="action" />
        </IconButton>
        <IconButton
          component="div"
          className={classes.socialButtons}
          onClick={launchFacebook}>
          <FacebookIcon color="action" />
        </IconButton>
        <Typography variant="body2" color="textSecondary" align="center">
          {`Copyright © ${new Date().getFullYear()} `}
          <a
            href="https://www.cv19assist.com"
            target="_blank"
            rel="noopener noreferrer">
            CV19Assist.com
          </a>{' '}
          | <Link to={PRIVACY_POLICY_PATH}>Privacy Policy</Link> |{' '}
          <Link to={TERMS_OF_SERVICE_PATH}>Terms of Service</Link>
        </Typography>
        <Typography variant="body2" color="textSecondary" align="center">
          {version}
          {/* <span
            dangerouslySetInnerHTML={{
              __html: `<!-- v${version} - ${environment.get(
                'abbreviation'
              )} -->`
            }}
          /> */}
        </Typography>
      </footer>
    </div>
  );
}

CoreLayout.propTypes = {
  children: PropTypes.element.isRequired,
};

export default CoreLayout;
