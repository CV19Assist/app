import React from 'react';
import PropTypes from 'prop-types';
import { SuspenseWithPerf } from 'reactfire';
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

const useStyles = makeStyles(styles);

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
          </a>
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
