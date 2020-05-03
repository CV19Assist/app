import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useUser } from 'reactfire';
import { Alert } from '@material-ui/lab';
import { LOGIN_PATH } from 'constants/paths';
import { Button, Grid, Typography, makeStyles } from '@material-ui/core';
import {
  ThumbUp as AcceptIcon,
  Check as CompleteIcon,
  RemoveCircleOutline as ReleaseIcon,
  Add as LoginIcon,
} from '@material-ui/icons';
import RequestActionDialog from '../RequestActionDialog';
import styles from './RequestActions.styles';

const useStyles = makeStyles(styles);

function RequestActions({ requestPublicSnapshot }) {
  const classes = useStyles();
  const user = useUser();

  const [showAcceptanceWorkflow, setShowAcceptanceWorkflow] = useState(false);
  const [showReleaseWorkflow, setShowReleaseWorkflow] = useState(false);
  const [showCompletionWorkflow, setShowCompletionWorkflow] = useState(false);

  let body = null;
  const status = requestPublicSnapshot.get('d.status');

  // Completed request.
  if (status === 20) {
    if (user && user.uid === requestPublicSnapshot.get('d.owner')) {
      body = (
        <Grid item>
          <Alert severity="success">
            Thank you for completing this request.
          </Alert>
        </Grid>
      );
    } else {
      body = (
        <Grid item>
          <Alert severity="success">This request has been fulfilled.</Alert>
        </Grid>
      );
    }
  } else if (!user || !user.uid) {
    // Not logged in, not complete
    body = (
      <Grid item>
        <Button
          component={Link}
          to={LOGIN_PATH}
          variant="contained"
          color="primary"
          startIcon={<LoginIcon />}>
          Please sign up as a volunteer to accept this request
        </Button>
      </Grid>
    );
  } else if (user && user.uid === requestPublicSnapshot.get('d.owner')) {
    // Logged, assigned to current user.
    body = (
      <>
        <RequestActionDialog
          actionType="complete"
          requestPublicSnapshot={requestPublicSnapshot}
          open={showCompletionWorkflow}
          onCancel={() => setShowCompletionWorkflow(false)}
          onCloseDialog={() => setShowCompletionWorkflow(false)}
        />
        <RequestActionDialog
          actionType="release"
          requestPublicSnapshot={requestPublicSnapshot}
          open={showReleaseWorkflow}
          onCancel={() => setShowReleaseWorkflow(false)}
          onCloseDialog={() => setShowReleaseWorkflow(false)}
        />
        <Grid item>
          <Button
            variant="outlined"
            className={classes.actionButton}
            onClick={() => setShowReleaseWorkflow(true)}
            startIcon={<ReleaseIcon />}>
            RELEASE
          </Button>
        </Grid>
        <Grid item>
          <Button
            className={classes.actionButton}
            variant="contained"
            color="primary"
            onClick={() => setShowCompletionWorkflow(true)}
            startIcon={<CompleteIcon />}>
            COMPLETE
          </Button>
        </Grid>
      </>
    );
  } else if (requestPublicSnapshot.get('status') === 10) {
    // Logged, assigned to a DIFFERENT user.
    body = (
      <Alert severity="info">
        Sorry, this is already assigned to another user. The other user will
        have to first release it before you can take it.
      </Alert>
    );
  } else {
    // Logged in, not assigned
    body = (
      <>
        <Grid item xs={12}>
          <Typography color="secondary" align="left" variant="body1">
            PLEASE MAKE SURE THAT YOU MEET THE CRITERIA BELOW BEFORE
            VOLUNTEERING
          </Typography>

          <ul>
            <li>
              I am not exhibiting any symptoms of COVID-19 (cough, fever, etc.)
            </li>
            <li>
              I have not come in contact with anyone exhibiting COVID-19
              symptoms in the past 14 days
            </li>
            <li>I have been practicing social distancing</li>
            <li>
              I am not part of the{' '}
              <a
                href="https://www.cdc.gov/coronavirus/2019-ncov/specific-groups/people-at-higher-risk.html"
                target="_blank"
                rel="noopener noreferrer">
                at-risk group
              </a>
            </li>
            <li>
              I am in good overall health and can practice social distancing if
              needed to go to public places.
            </li>
          </ul>
        </Grid>

        <RequestActionDialog
          actionType="accept"
          requestPublicSnapshot={requestPublicSnapshot}
          open={showAcceptanceWorkflow}
          onCancel={() => setShowAcceptanceWorkflow(false)}
          onCloseDialog={() => setShowAcceptanceWorkflow(false)}
        />
        <Grid item>
          <Button
            onClick={() => setShowAcceptanceWorkflow(true)}
            variant="contained"
            color="primary"
            data-test="request-assign-button"
            startIcon={<AcceptIcon />}>
            Assign to me
          </Button>
        </Grid>
      </>
    );
  }

  return (
    <Grid container spacing={2} justify="flex-end">
      {body}
    </Grid>
  );
}

RequestActions.propTypes = {
  requestPublicSnapshot: PropTypes.object.isRequired,
};

export default RequestActions;
