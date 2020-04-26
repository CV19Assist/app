import React, { useState, useEffect } from 'react';
import { debounceTime } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Helmet } from 'react-helmet';
import { Link, generatePath } from 'react-router-dom';
import { format } from 'date-fns';
import { useFirestore, useUser, useAnalytics } from 'reactfire';
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from 'react-places-autocomplete';
import { GeoFirestore } from 'geofirestore';
import {
  Typography,
  Container,
  Grid,
  Button,
  Divider,
  Hidden,
  Paper,
  Slider,
  Chip,
  TextField,
  CircularProgress,
  LinearProgress,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { makeStyles } from '@material-ui/core/styles';
import { LoadScript } from '@react-google-maps/api';
import {
  ShoppingBasket as GroceryIcon,
  AttachMoney as FinancialAssitanceIcon,
} from '@material-ui/icons';
import { kmToMiles } from 'utils/geo';
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
  DEFAULT_LOCATION_NAME,
  USED_GOOGLE_MAPS_LIBRARIES,
} from 'constants/geo';
import { REQUEST_PATH } from 'constants/paths';
import styles from './SearchPage.styles';

const useStyles = makeStyles(styles);

const markValues = [
  { value: 1, label: '1 mi' },
  { value: 60, label: '60 mi' },
];

// Default distance in miles.
const defaultDistance = 25;

function SearchPage() {
  const classes = useStyles();
  const { showError } = useNotifications();

  // State
  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [nearbyRequests, setNearbyRequests] = useState(null);
  const [currentLatLong, setCurrentLatLong] = useState({
    latitude: DEFAULT_LATITUDE,
    longitude: DEFAULT_LONGITUDE,
  });
  const [currentPlaceLabel, setCurrentPlaceLabel] = React.useState(
    `Using default location: ${DEFAULT_LOCATION_NAME}`,
  );
  const [distance, setDistance] = useState(defaultDistance);
  const [searching, setSearching] = useState(false);

  const [onSearch$] = useState(() => new Subject());

  // Data
  const user = useUser();
  const firestore = useFirestore();
  const analytics = useAnalytics();
  const { GeoPoint } = useFirestore;

  async function searchForNearbyRequests({ searchLocation, searchDistance }) {
    if (!searchLocation) return;
    // Use lat/long set to state (either from profile or default)
    const { latitude, longitude } = searchLocation;
    setSearching(true);
    try {
      // Query for nearby requests
      const geofirestore = new GeoFirestore(firestore);
      const nearbyRequestsSnap = await geofirestore
        .collection(REQUESTS_PUBLIC_COLLECTION)
        .near({
          center: new GeoPoint(latitude, longitude),
          radius: KM_TO_MILES * searchDistance,
        })
        .where('status', '==', 1)
        .limit(30)
        .get();
      const sortedByDistance = nearbyRequestsSnap.docs.sort(
        (a, b) => a.distance - b.distance,
      );
      setNearbyRequests(
        sortedByDistance.map((docSnap) => ({
          ...docSnap.data(),
          id: docSnap.id,
          distance: kmToMiles(docSnap.distance).toFixed(2),
        })),
      );
      setSearching(false);
    } catch (err) {
      showError('Error searching for nearby requests');
      // eslint-disable-next-line no-console
      console.log(err);
      setSearching(false);
    }
    searchForNearbyRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, currentLatLong, distance]);

  // Setup an observable for debouncing the search requests.
  useEffect(() => {
    const subscription = onSearch$
      .pipe(debounceTime(500))
      .subscribe(searchForNearbyRequests);

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // This pushes new empty values to the observable when the distance or location changes.
  useEffect(() => {
    onSearch$.next({
      searchLocation: currentLatLong,
      searchDistance: distance,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLatLong, distance]);

  useEffect(() => {
    async function loadLatLongFromProfile() {
      // TODO: Search is triggered twice when the user is logged in. Once with the first render,
      //       and then again when the user is assigned.  Need to fix this behavior.
      // Set lat/long from profile or fallback to defaults
      if (user && user.uid) {
        const profileRef = firestore.doc(`${USERS_COLLECTION}/${user.uid}`);
        const profileSnap = await profileRef.get();
        const geopoint = profileSnap.get('preciseLocation');
        const preciseLocationName = profileSnap.get('preciseLocationName');
        if (geopoint) {
          const userLocation = {
            latitude: geopoint.latitude,
            longitude: geopoint.longitude,
          };
          setCurrentLatLong(userLocation);
          setCurrentPlaceLabel(preciseLocationName);
          onSearch$.next({
            searchLocation: userLocation,
            searchDistance: defaultDistance,
          });
        } else {
          onSearch$.next({
            searchLocation: currentLatLong,
            searchDistance: defaultDistance,
          });
        }
      } else {
        onSearch$.next({
          searchLocation: currentLatLong,
          searchDistance: defaultDistance,
        });
      }
    }
    // NOTE: useEffect is used to load data so it can be done conditionally based
    // on whether current user is logged in
    loadLatLongFromProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function handleCopyNeedLink(id) {
    const el = document.createElement('textarea');
    document.body.appendChild(el);
    el.value = `${window.location.origin}${generatePath(REQUEST_PATH, {
      requestId: id,
    })}`;
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }

  // Gets the lat/lng for the selected address.
  function handlePlaceSelect(_event, selection) {
    if (!selection) return;
    geocodeByAddress(selection.description)
      .then((results) => getLatLng(results[0]))
      .then((latLng) => {
        setCurrentLatLong({ latitude: latLng.lat, longitude: latLng.lng });
      })
      .catch((error) => {
        showError('Failed to get the location from address.');
        // eslint-disable-next-line no-console
        console.error('Error', error);
      });
  }

  function handlePlaceChange(address) {
    setCurrentPlaceLabel(address);
  }

  return (
    <Container maxWidth="md">
      <Helmet>
        <title>Find Opportunities</title>
      </Helmet>
      <Typography variant="h6">Search Criteria</Typography>
      <Paper className={classes.filterPaper}>
        {!showAddressPicker && (
          <div className={classes.searchLocation}>
            <Typography id="continuous-slider">{currentPlaceLabel}</Typography>
            <Button
              data-test="new-location-button"
              onClick={() => setShowAddressPicker(true)}
              className={classes.enterAddressButton}>
              Select new location
            </Button>
          </div>
        )}
        {showAddressPicker && (
          <LoadScript
            id="script-loader"
            libraries={USED_GOOGLE_MAPS_LIBRARIES}
            googleMapsApiKey={process.env.REACT_APP_FIREBASE_API_KEY}>
            <PlacesAutocomplete
              value={currentPlaceLabel}
              onChange={handlePlaceChange}>
              {({ getInputProps, suggestions, loading }) => (
                <>
                  {/* {console.log(suggestions)} */}
                  <Autocomplete
                    data-test="places-autocomplete"
                    onChange={handlePlaceSelect}
                    options={suggestions}
                    loading={loading}
                    getOptionLabel={(sug) => sug.description}
                    noOptionsText="No matches"
                    renderInput={(params) => (
                      <TextField
                        data-test="address-entry"
                        {...getInputProps({
                          ...params,
                          label: 'Address',
                          className: classes.searchInput,
                        })}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loading && (
                                <CircularProgress color="inherit" size={20} />
                              )}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </>
              )}
            </PlacesAutocomplete>
          </LoadScript>
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
            onChange={(_event, value) => setDistance(value)}
            min={1}
            max={markValues[markValues.length - 1].value}
          />
        </div>
      </Paper>
      {searching && (
        <Paper className={classes.simplePaper}>
          <LinearProgress />
        </Paper>
      )}
      {nearbyRequests && nearbyRequests.length === 0 && (
        <Paper className={classes.simplePaper}>
          <Typography data-test="no-requests-found">
            No requests found with {distance} miles. You can try expanding the
            search area or try entering a new location.
          </Typography>
        </Paper>
      )}
      {nearbyRequests &&
        nearbyRequests.map((result) => (
          <Paper className={classes.resultPaper} key={result.id}>
            <Grid container>
              <Hidden smDown>
                <Grid item className={classes.distanceContainer} sm={2}>
                  {result.distance}
                  <br />
                  miles
                </Grid>
              </Hidden>
              <Grid item className={classes.requestSummary} sm={10}>
                {parseInt(result.immediacy, 10) > 5 && (
                  <img
                    align="right"
                    src="/taskIcon.png"
                    width="50px"
                    height="50px"
                    alt="Urgent"
                    title="Urgent"
                  />
                )}

                <Typography variant="h6">
                  {result.name ? result.name : result.firstName} &ndash;{' '}
                  {result.generalLocationName}
                </Typography>

                <Typography variant="caption" gutterBottom>
                  Requested {format(result.createdAt.toDate(), 'p - PPPP')}
                </Typography>

                <Typography variant="h5" className={classes.needs} gutterBottom>
                  {result.needs.map((item) => (
                    <React.Fragment key={item}>
                      {allCategoryMap[item] ? (
                        <Chip
                          size="small"
                          variant="outlined"
                          icon={
                            item === 'grocery-pickup' ? <GroceryIcon /> : null
                          }
                          label={allCategoryMap[item].shortDescription}
                        />
                      ) : (
                        <Alert severity="error">
                          Could not find &apos;{item}&apos; in all category map.
                        </Alert>
                      )}
                    </React.Fragment>
                  ))}
                  {result.needFinancialAssistance && (
                    <Chip
                      variant="outlined"
                      size="small"
                      icon={<FinancialAssitanceIcon />}
                      label="Need financial assistance"
                    />
                  )}
                </Typography>

                <Hidden smUp>
                  <Typography
                    align="right"
                    variant="h5"
                    className={classes.TaskTitle}>
                    {result.distance} miles
                  </Typography>
                </Hidden>

                <Grid container justify="flex-end">
                  <Grid item>
                    {navigator.share ? (
                      <Button
                        size="small"
                        onClick={() => {
                          navigator.share({
                            title: 'CV19 Assist Need Link',
                            text: 'CV19 Assist Need Link',
                            url: `${window.location.origin}${generatePath(
                              REQUEST_PATH,
                              {
                                requestId: result.id,
                              },
                            )}`,
                          });
                        }}>
                        SHARE
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        onClick={() => handleCopyNeedLink(result.id)}>
                        COPY LINK FOR SHARING
                      </Button>
                    )}{' '}
                    <Button
                      component={Link}
                      to={generatePath(REQUEST_PATH, {
                        requestId: result.id,
                      })}
                      size="small"
                      color="primary"
                      disableElevation>
                      DETAILS...
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        ))}
    </Container>
  );
}

// export default SearchPage;
export default SearchPage;
