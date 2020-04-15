import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { useFirestore, useUser } from 'reactfire';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Card from '@material-ui/core/Card';
import Paper from '@material-ui/core/Paper';
import CardContent from '@material-ui/core/CardContent';
import Slider from '@material-ui/core/Slider';
import Chip from '@material-ui/core/Chip';
import Alert from '@material-ui/lab/Alert';
// import TextField from '@material-ui/core/TextField';
// import Autocomplete from '@material-ui/lab/Autocomplete';
// import LinearProgress from '@material-ui/core/LinearProgress';
import { makeStyles } from '@material-ui/core/styles';
import { GeoFirestore } from 'geofirestore';
import { distanceBetweenPoints } from 'utils/geo';
import { useNotifications } from 'modules/notification';
import {
  REQUESTS_PUBLIC_COLLECTION,
  USERS_COLLECTION,
} from 'constants/collections';
import { allCategoryMap } from 'constants/categories';
import {
  KM_TO_MILES,
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE,
} from 'constants/geo';
import styles from './SearchPage.styles';

const useStyles = makeStyles(styles);

const markValues = [
  { value: 1, label: '1 mi' },
  // { value: 2, label: '2 mi', },
  // { value: 5, label: '5 mi', },
  // { value: 20, label: '20 mi', },
  { value: 30, label: '30 mi' },
  // { value: 50, label: '50 mi', },
  // { value: 90, label: '90 mi', },
];

// Default distance in miles.
const defaultDistance = 25;

function SearchPage() {
  const classes = useStyles();
  const location = useLocation();
  const { showError } = useNotifications();

  // State
  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [nearbyRequests, setNearbyRequests] = useState(null);
  const [currentLatLong, setCurrentLatLong] = useState({
    latitude: DEFAULT_LATITUDE,
    longitude: DEFAULT_LONGITUDE,
  });
  const [distance, setDistance] = useState(defaultDistance);

  // Data
  const user = useUser();
  const firestore = useFirestore();
  const { GeoPoint } = useFirestore;

  useEffect(() => {
    async function loadLatLongFromProfile() {
      // Set lat/long from profile or fallback to defaults
      if (user && user.uid) {
        const profileRef = firestore.doc(`${USERS_COLLECTION}/${user.uid}`);
        const profileSnap = await profileRef.get();
        const geopoint = profileSnap.get('preciseLocation');
        const { latitude, longitude } = geopoint;
        setCurrentLatLong({ latitude, longitude });
      }
    }
    // NOTE: useEffect is used to load data so it can be done conditionally based
    // on whether current user is logged in
    loadLatLongFromProfile();
  }, [user, firestore]);

  console.log('Search page state:', { distance, nearbyRequests }); // eslint-disable-line no-console

  async function searchForNearbyRequests() {
    // Use lat/long set to state (either from profile or default)
    const { latitude, longitude } = currentLatLong;
    try {
      // Query for nearby requests
      const geofirestore = new GeoFirestore(firestore);
      const nearbyRequestsSnap = await geofirestore
        .collection(REQUESTS_PUBLIC_COLLECTION)
        .near({
          center: new GeoPoint(latitude, longitude),
          radius: KM_TO_MILES * distance,
        })
        // NOTE: Queries d.status on object thanks to geofirestore
        .where('status', '==', 1)
        .limit(60)
        .get();
      setNearbyRequests(
        nearbyRequestsSnap.docs.map((docSnap) => ({
          ...docSnap.data(),
          id: docSnap.id,
        })),
      );
    } catch (err) {
      showError('Error searching for nearby requests');
    }
  }

  function handleCopyNeedLink(id) {
    const el = document.createElement('textarea');
    document.body.appendChild(el);
    el.value = `${location.origin}/needs/${id}`;
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }

  return (
    <Container maxWidth="md">
      <Helmet>
        <title>Find Opportunities</title>
      </Helmet>
      <Typography variant="h6">Search Criteria</Typography>
      <Paper className={classes.filterPaper}>
        {!showAddressPicker && (
          <Typography id="continuous-slider" gutterBottom>
            Using your default location.
            <Button onClick={() => setShowAddressPicker(true)}>
              Select new location
            </Button>
          </Typography>
        )}

        <Divider className={classes.divider} />

        <Typography id="continuous-slider" gutterBottom>
          Distance (in miles)
        </Typography>
        <div className={classes.distance}>
          <Slider
            defaultValue={defaultDistance}
            valueLabelDisplay="on"
            // valueLabelFormat={x => `${x} mi`}
            marks={markValues}
            onChange={(event, value) => setDistance(value)}
            // step={null}
            min={1}
            max={30}
          />
        </div>

        <Divider className={classes.divider} />
        <Button
          variant="contained"
          color="primary"
          onClick={searchForNearbyRequests}>
          Search
        </Button>
      </Paper>
      {/* {searchStatus === 'loading' && (
        <Card className={classes.cards}>
          <CardContent>
            <LinearProgress />
          </CardContent>
        </Card>
      )}
      {!results && searchStatus !== 'loading' && (
        <Card className={classes.cards}>
          <CardContent>
            <Typography>No results.</Typography>
          </CardContent>
        </Card>
      )} */}
      {nearbyRequests && nearbyRequests.length === 0 && (
        <Card className={classes.cards}>
          <CardContent>
            <Typography>
              No requests found. You can try expanding the search area.
            </Typography>
          </CardContent>
        </Card>
      )}
      {nearbyRequests &&
        nearbyRequests.map((result) => (
          <Card key={result.id} className={classes.cards}>
            <Container maxWidth="lg" className={classes.TaskContainer}>
              <Grid container>
                <Grid item xs={9}>
                  <Typography variant="caption" gutterBottom>
                    ADDED {format(result.createdAt.toDate(), 'p - PPPP')}
                  </Typography>
                  <Typography
                    variant="h5"
                    className={classes.TaskTitle}
                    gutterBottom>
                    {result.needs.map((item) => (
                      <React.Fragment key={item}>
                        {allCategoryMap[item] ? (
                          <Chip label={allCategoryMap[item].shortDescription} />
                        ) : (
                          <Alert severity="error">
                            Could not find &apos;{item}&apos; in all category
                            map.
                          </Alert>
                        )}
                        <br />
                      </React.Fragment>
                    ))}
                  </Typography>
                </Grid>

                {parseInt(result.immediacy, 10) > 5 && (
                  <Grid item xs={3}>
                    <img
                      align="right"
                      src="/taskIcon.png"
                      width="50px"
                      height="50px"
                      alt="Urgent"
                      title="Urgent"
                    />
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Typography variant="caption" gutterBottom>
                    REQUESTOR
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="h6">
                    {result.name ? result.name : result.firstName}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography
                    align="right"
                    variant="h5"
                    className={classes.TaskTitle}>
                    {distanceBetweenPoints(
                      result.coordinates.latitude,
                      result.coordinates.longitude,
                      currentLatLong.latitude,
                      currentLatLong.longitude,
                    ).toFixed(2)}{' '}
                    miles
                  </Typography>
                </Grid>

                <Grid
                  className={classes.DetailsButton}
                  align="right"
                  item
                  xs={12}>
                  {navigator.share ? (
                    <Button
                      color="primary"
                      variant="outlined"
                      onClick={() => {
                        navigator.share({
                          title: 'CV19 Assist Need Link',
                          text: 'CV19 Assist Need Link',
                          url: `${location.origin}/needs/${result.id}`,
                        });
                      }}>
                      SHARE
                    </Button>
                  ) : (
                    <Button
                      color="primary"
                      variant="outlined"
                      onClick={() => handleCopyNeedLink(result.id)}>
                      COPY LINK FOR SHARING
                    </Button>
                  )}{' '}
                  <Button variant="contained" color="primary">
                    DETAILS...
                  </Button>
                </Grid>
              </Grid>
            </Container>
          </Card>
        ))}
      {/* <Grid container>
        <Grid item xs className={classes.center}>
          <Button variant="contained" className={classes.arrows}>
            {<ArrowDropDownIcon className={classes.icons} />}
          </Button>
        </Grid>
      </Grid> */}
    </Container>
  );
}

export default SearchPage;
