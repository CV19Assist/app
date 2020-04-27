import React, { useEffect } from 'react';
import { useFirebaseApp } from 'reactfire';
import { useHistory } from 'react-router-dom';
import {
  makeStyles,
  Container,
  Typography,
  Paper,
  LinearProgress,
} from '@material-ui/core';
import { Helmet } from 'react-helmet';
import styles from './LogoutPage.styles';

const useStyles = makeStyles(styles);

function LogoutPage() {
  const classes = useStyles();
  const firebase = useFirebaseApp();
  const history = useHistory();

  useEffect(() => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        history.replace('/');
      });
  }, [firebase, history]);

  return (
    <Container maxWidth="md">
      <Helmet>
        <title>Logging Out</title>
      </Helmet>
      <Paper className={classes.paper}>
        <Typography
          variant="h5"
          align="center"
          color="textPrimary"
          gutterBottom>
          Logging out...
        </Typography>
        <LinearProgress />
      </Paper>
    </Container>
  );
}

export default LogoutPage;
