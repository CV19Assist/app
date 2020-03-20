import React from 'react';
import Typography from '@material-ui/core/Typography';
// import { makeStyles } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../modules/user';

// const useStyles = makeStyles(theme => ({
// }));

function Profile() {
  // const classes = useStyles();
  const user = useSelector(state => state.get("user"));
  const userProfile = user.get("userProfile");
  const authUser = user.get("authUser");
  const dispatch = useDispatch();

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
            {userProfile.get("displayName")}
          </Typography>
          <Typography
            id="content-homepage"
            variant="h5"
            align="center"
            color="textSecondary"
            paragraph
          >
            {authUser.providerData[0].providerId}
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