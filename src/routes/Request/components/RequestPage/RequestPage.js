/* eslint-disable no-nested-ternary */
import React, { Suspense } from 'react';
import { useFirestore, useFirestoreDoc, useUser } from 'reactfire';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Divider,
  Container,
  Typography,
  Paper,
  Hidden,
  Chip,
  Box,
  makeStyles,
} from '@material-ui/core';
import { Alert, Skeleton } from '@material-ui/lab';
import { allCategoryMap } from 'constants/categories';
import { REQUESTS_PUBLIC_COLLECTION } from 'constants/collections';
import ContactInfo from '../ContactInfo';
import PublicComments from '../PublicComments';
import Discussion from '../Discussion';
import RequestActions from '../RequestActions';
import styles from './RequestPage.styles';

const useStyles = makeStyles(styles);

function RequestPage() {
  const classes = useStyles();
  const { requestId } = useParams();
  const firestore = useFirestore();
  const user = useUser();

  const requestPublicSnap = useFirestoreDoc(
    firestore.doc(`${REQUESTS_PUBLIC_COLLECTION}/${requestId}`),
  );

  if (!requestPublicSnap.exists) {
    return (
      <Container>
        <Helmet>
          <title>Request Not Found</title>
        </Helmet>
        <Paper className={classes.paper} data-test="request-not-found">
          Request Not Found
        </Paper>
      </Container>
    );
  }

  let immediacy = 0;
  if (requestPublicSnap.exists) {
    immediacy = parseInt(requestPublicSnap.get('d.immediacy'), 10);
  }

  const { latitude, longitude } =
    requestPublicSnap.get('d.generalLocation') || {};
  const generalLocationName =
    requestPublicSnap.get('d.generalLocationName') || '';

  const mapImage = (
    <img
      className={classes.map}
      alt={requestPublicSnap.get('d.generalLocationName')}
      title={requestPublicSnap.get('d.generalLocationName')}
      src={`https://maps.googleapis.com/maps/api/staticmap?key=${process.env.REACT_APP_FIREBASE_API_KEY}&center=${latitude},${longitude}&markers=${latitude},${longitude}&size=280x280&zoom=10`}
    />
  );

  return (
    <>
      <Helmet>
        <title>
          {requestPublicSnap.get('d.firstName') || ''} &ndash;{' '}
          {generalLocationName}
        </title>
      </Helmet>
      <Container
        className={classes.header}
        data-test="request-title"
        maxWidth={false}>
        <Container>
          <Typography variant="h5" gutterBottom>
            {requestPublicSnap.get('d.firstName')}{' '}
            {/* {user &&
              user.uid &&
              requestPublicSnap.get('d.owner') === user.uid &&
              `${requestPublicSnap.get('d.lastName')} `} */}
            &ndash; {generalLocationName}
          </Typography>
        </Container>
      </Container>

      <Container className={classes.bodyContainer}>
        <Paper className={classes.paper} data-test="request-info">
          <Hidden smUp>
            <div className={classes.mobileImageContainer}>{mapImage}</div>
          </Hidden>

          <div className={classes.basicInfoContainer}>
            <div className={classes.basicInfo}>
              <Typography variant="h6" gutterBottom>
                {immediacy === 1
                  ? 'Not urgent'
                  : immediacy <= 5
                  ? 'Not very urgent'
                  : 'URGENT'}
                :{' '}
                {requestPublicSnap.get('d.needs') &&
                  requestPublicSnap
                    .get('d.needs')
                    .map((item) => (
                      <React.Fragment key={item}>
                        {allCategoryMap[item] ? (
                          <Chip
                            label={allCategoryMap[item].shortDescription}
                            className={classes.needChip}
                          />
                        ) : (
                          <Alert severity="error">
                            Could not find &apos;{item}&apos; in all category
                            map.
                          </Alert>
                        )}
                      </React.Fragment>
                    ))}
              </Typography>

              <Typography variant="caption" gutterBottom>
                REQUESTED
              </Typography>
              <Typography variant="h6" gutterBottom>
                {requestPublicSnap.get('d.createdAt') &&
                  format(
                    requestPublicSnap.get('d.createdAt').toDate(),
                    'EEE, MMM d, yyyy h:mm a',
                  )}
              </Typography>

              <Typography variant="caption">CONTACT</Typography>
              <Typography variant="h6" gutterBottom>
                <ContactInfo requestId={requestId} />
              </Typography>

              <Typography variant="caption" gutterBottom>
                OTHER DETAILS
              </Typography>
              {requestPublicSnap.get('d.otherDetails') ? (
                <Typography variant="h6" gutterBottom>
                  {requestPublicSnap.get('d.otherDetails')}
                </Typography>
              ) : (
                <Box color="text.disabled">
                  <Typography
                    variant="body2"
                    gutterBottom
                    className={classes.noDetails}>
                    No other details provided.
                  </Typography>
                </Box>
              )}
            </div>
            <Hidden xsDown>{mapImage}</Hidden>
          </div>

          <Divider className={classes.divider} />

          <Suspense fallback={<Skeleton />}>
            <RequestActions requestPublicSnapshot={requestPublicSnap} />
          </Suspense>
        </Paper>

        <Paper className={classes.paper} data-test="public-comments">
          <PublicComments requestId={requestId} />
        </Paper>

        {/* Only show for authenticated users. */}
        {user && user.uid && <Discussion requestId={requestId} />}
      </Container>
    </>
  );
}

export default RequestPage;
