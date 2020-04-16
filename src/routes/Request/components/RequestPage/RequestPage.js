/* eslint-disable no-nested-ternary */
import React from 'react';
import PropTypes from 'prop-types';
import { useFirestore, useFirestoreDoc, useUser } from 'reactfire';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import Divider from '@material-ui/core/Divider';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Alert from '@material-ui/lab/Alert';
import Chip from '@material-ui/core/Chip';
import AcceptIcon from '@material-ui/icons/ThumbUp';
import CompleteIcon from '@material-ui/icons/Check';
import ReleaseIcon from '@material-ui/icons/RemoveCircleOutline';
import LoginIcon from '@material-ui/icons/Add';
import { makeStyles } from '@material-ui/core/styles';
// import { cacheLaunchURL } from '../modules/user';
import { allCategoryMap } from 'constants/categories';
import { REQUESTS_COLLECTION } from 'constants/collections';
import styles from './RequestPage.styles';

const useStyles = makeStyles(styles);

function RequestPage({ hideActionButtons }) {
  const classes = useStyles();
  const { requestId } = useParams();
  const firestore = useFirestore();
  const user = useUser();

  const requestRef = firestore.doc(`${REQUESTS_COLLECTION}/${requestId}`);
  const requestSnap = useFirestoreDoc(requestRef);
  if (!requestSnap.exists) {
    return <div>Not Found</div>;
  }
  function handleCompletion() {
    // dispatch(completeNeedAssignment(id));
  }

  function handleRequestAssignment() {
    // dispatch(submitForAssignment({ id: need.get('id') }));
  }

  function handleRelease() {
    // dispatch(releaseNeedAssignment(id));
  }

  function handleVolunteerToAccept() {
    // dispatch(
    //   cacheLaunchURL(`${location.pathname}${location.search}${location.hash}`),
    // );
    // dispatch(push('/login'));
  }

  // const handleShowContactInfo = () => {
  //   dispatch(loadNeedContactInfo(id));
  // };

  let immediacy = 0;
  if (requestSnap.exists) {
    immediacy = parseInt(requestSnap.get('immediacy'), 10);
  }

  const { latitude, longitude } = requestSnap.get('preciseLocation');

  return (
    <Container>
      <Helmet>
        <title>Details</title>
      </Helmet>
      <Paper className={classes.paper} data-test="request-info">
        <img
          style={{ float: 'right' }}
          alt="Request's location"
          src={`https://maps.googleapis.com/maps/api/staticmap?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&center=${latitude},${longitude}&markers=${latitude},${longitude}&size=280x280&zoom=10`}
        />

        {/* <Typography variant="caption" gutterBottom>
          DESCRIPTION
        </Typography>
        <Typography variant="h5" gutterBottom>
          {need.get("shortDescription")}
        </Typography> */}

        <Typography variant="caption" gutterBottom>
          NEEDS
        </Typography>
        <Typography variant="h6" gutterBottom>
          {immediacy === 1
            ? 'URGENT'
            : immediacy <= 5
            ? 'Not very urgent: '
            : 'URGENT: '}
          {requestSnap.get('needs') &&
            Object.keys(requestSnap.get('needs')).map((item) => (
              <React.Fragment key={item}>
                {allCategoryMap[item] ? (
                  <Chip label={allCategoryMap[item].shortDescription} />
                ) : (
                  <Alert severity="error">
                    Could not find &apos;{item}&apos; in all category map.
                  </Alert>
                )}
                <br />
              </React.Fragment>
            ))}
        </Typography>

        <Typography variant="caption" gutterBottom>
          REQUESTED
        </Typography>
        <Typography variant="h6" gutterBottom>
          {requestSnap.get('createdAt') &&
            format(
              requestSnap.get('createdAt').toDate(),
              'EEE, MMM d, yyyy h:mm a',
            )}
        </Typography>

        <Typography variant="caption" gutterBottom>
          REQUESTOR
        </Typography>
        <Typography variant="h6" gutterBottom>
          {requestSnap.get('name')
            ? requestSnap.get('name')
            : requestSnap.get('firstName')}
        </Typography>

        <Typography variant="caption">CONTACT</Typography>
        <Typography variant="h6" gutterBottom>
          {requestSnap.get('contactInfo')}
        </Typography>
        {/* {!need.get("contactInfo") ? (
          <Typography variant="body2" gutterBottom>
            For privacy reasons we do not show the contact info right away. To
            see, <Link onClick={handleShowContactInfo}>please click here</Link>.
          </Typography>
        ) : (
          <Typography variant="h6" gutterBottom>
            {need.get("contactInfo")}
          </Typography>
        )} */}

        <Typography variant="caption" gutterBottom>
          OTHER DETAILS
        </Typography>
        {requestSnap.get('otherDetails') ? (
          <Typography variant="h6" gutterBottom>
            {requestSnap.get('otherDetails')}
          </Typography>
        ) : (
          <Typography variant="body2" gutterBottom>
            No other details provided.
          </Typography>
        )}

        <Divider className={classes.divider} />

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography color="secondary" align="left" variant="body1">
              PLEASE MAKE SURE THAT YOU MEET THE CRITERIA BELOW BEFORE
              VOLUNTEERING
            </Typography>

            <ul>
              <li>
                I am not exhibiting any symptoms of COVID-19 (cough, fever,
                etc.)
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
                I am in good overall health and can practice social distancing
                if needed to go to public places.
              </li>
            </ul>
          </Grid>

          {/* If not specifically asked to hide. */}
          {!hideActionButtons && (
            <Grid container spacing={2} justify="flex-end">
              {
                // Completed
                requestSnap.get('status') === 20 ? (
                  <Grid item>
                    <Alert severity="success">
                      This request has been fulfilled.
                    </Alert>
                  </Grid>
                ) : // Not completed
                !user || !user.uid ? (
                  // Not logged in, not complete
                  <Grid item>
                    <Button
                      onClick={handleVolunteerToAccept}
                      variant="contained"
                      color="primary"
                      startIcon={<LoginIcon />}>
                      Please sign up as a volunteer to accept this request
                    </Button>
                  </Grid>
                ) : // Logged in, not complete
                requestSnap.get('status') === 10 ? (
                  // Logged, assigned.
                  user && user.uid === requestSnap.get('owner') ? (
                    // Logged, assigned to current user.
                    <>
                      <Grid item>
                        <Button
                          variant="outlined"
                          className={classes.actionButton}
                          onClick={handleRelease}
                          startIcon={<ReleaseIcon />}>
                          RELEASE
                        </Button>
                      </Grid>
                      <Grid item>
                        <Button
                          className={classes.actionButton}
                          variant="contained"
                          color="primary"
                          onClick={handleCompletion}
                          startIcon={<CompleteIcon />}>
                          COMPLETE
                        </Button>
                      </Grid>
                    </>
                  ) : (
                    // Logged, assigned to a DIFFERENT user.
                    <Alert severity="info">
                      Sorry, this is already assigned to another user. The other
                      user will have to first release it before you can take it.
                    </Alert>
                  )
                ) : (
                  // Logged in, not assigned
                  <Grid item>
                    <Button
                      onClick={handleRequestAssignment}
                      variant="contained"
                      color="primary"
                      startIcon={<AcceptIcon />}>
                      Assign to me
                    </Button>
                  </Grid>
                )
              }
            </Grid>
          )}
        </Grid>
      </Paper>
    </Container>
  );
}

RequestPage.propTypes = {
  hideActionButtons: PropTypes.bool,
};

export default RequestPage;
