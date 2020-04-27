import React from 'react';
import { Helmet } from 'react-helmet';
import { useFirestore, useUser, useFirestoreCollection } from 'reactfire';
import Paper from '@material-ui/core/Paper';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import { REQUESTS_COLLECTION } from 'constants/collections';
import { Link } from 'react-router-dom';
import { SEARCH_PATH } from 'constants/paths';
import styles from './MyRequestsPage.styles';
import RequestCard from '../RequestCard';

const useStyles = makeStyles(styles);

function MyRequestsPage() {
  const classes = useStyles();
  const firestore = useFirestore();
  const user = useUser();
  const userRequestsRef = firestore
    .collection(REQUESTS_COLLECTION)
    .where('owner', '==', user.uid);
  const openRequestsRef = userRequestsRef.where('status', '<', 20);
  const closedRequestsRef = userRequestsRef.where('status', '==', 20);
  const openRequestsSnap = useFirestoreCollection(openRequestsRef);
  const closedRequestsSnap = useFirestoreCollection(closedRequestsRef);

  if (!openRequestsSnap.docs && !closedRequestsSnap.doc) {
    return (
      <Container>
        <Helmet>
          <title>Requests Not Found</title>
        </Helmet>
        <Paper className={classes.paper} data-test="requests-not-found">
          Request Not Found
        </Paper>
      </Container>
    );
  }

  return (
    <Container>
      <Helmet>
        <title>My Requests</title>
      </Helmet>
      <Typography variant="h5">Open Requests</Typography>
      {openRequestsSnap && openRequestsSnap.docs.length ? (
        openRequestsSnap.docs.map((requestSnap) => (
          <RequestCard key={requestSnap.id} requestSnap={requestSnap} />
        ))
      ) : (
        <Paper className={classes.paper}>
          <Typography variant="body1" className={classes.emptyMessage}>
            You do not currently have any open requests
          </Typography>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to={SEARCH_PATH}>
            Find requests
          </Button>
        </Paper>
      )}
      <Typography variant="h5">Closed Requests</Typography>
      {closedRequestsSnap && closedRequestsSnap.docs.length ? (
        closedRequestsSnap.docs.map((requestSnap) => (
          <RequestCard key={requestSnap.id} requestSnap={requestSnap} />
        ))
      ) : (
        <Paper className={classes.paper}>
          <Typography variant="body1">
            Requests will appear here once they have been completed
          </Typography>
        </Paper>
      )}
    </Container>
  );
}

export default MyRequestsPage;
