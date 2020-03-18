import React from 'react';
import Typography from '@material-ui/core/Typography';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../modules/auth';

const useStyles = makeStyles(theme => ({
}));

function Profile() {
  const classes = useStyles();
  const user = useSelector(state => state.get("user"));
  const currentUser = user.get("currentUser");
  const dispatch = useDispatch();

  if (user.get("isAuthenticated") !== true || (currentUser === null)) {
    return <p>You are not logged in.</p>;
  }

  return (
    <React.Fragment>
      <Container maxWidth="md">
        <Paper>
          <Typography
            component="h3"
            variant="h3"
            align="center"
            color="textPrimary"
            gutterBottom
          >
            {currentUser.displayName}
          </Typography>
          <Typography
            id="content-homepage"
            variant="h5"
            align="center"
            color="textSecondary"
            paragraph
          >
            {currentUser.providerData[0].providerId}
          </Typography>

          <Button
            variant="outlined"
            onClick={() => dispatch(logout())}
          >
            Logout
          </Button>
        </Paper>
      </Container>
    </React.Fragment>
  );
}

export default Profile;