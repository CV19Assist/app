import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  GoogleMap,
  LoadScript,
  InfoWindow,
  Marker,
} from '@react-google-maps/api';
import {
  Typography,
  Button,
  CircularProgress,
  Backdrop,
  TextField,
  makeStyles,
} from '@material-ui/core';
import { useNotifications } from 'modules/notification';
import { scrambleLocation, reverseGeocode } from 'utils/geo';
import {
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE,
  USED_GOOGLE_MAPS_LIBRARIES,
} from 'constants/geo';
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from 'react-places-autocomplete';
import { MyLocation as DetectLocationIcon } from '@material-ui/icons';
import Autocomplete from '@material-ui/lab/Autocomplete';
import * as Sentry from '@sentry/browser';
import styles from './ClickableMap.styles';

const useStyles = makeStyles(styles);

function SelectedLocationMarker({
  position: { latitude: lat, longitude: lng },
  title,
}) {
  const [marker, setMarker] = useState(null);

  const handleOnLoad = (mapMarker) => {
    setMarker(mapMarker);
  };

  const renderInfoWindow = (mapMarker) => {
    if (mapMarker === null) return null;

    return (
      <InfoWindow anchor={mapMarker}>
        <div>
          <Typography variant="subtitle2">{title}</Typography>
        </div>
      </InfoWindow>
    );
  };

  return (
    <Marker position={{ lat, lng }} onLoad={handleOnLoad}>
      {renderInfoWindow(marker)}
    </Marker>
  );
}

SelectedLocationMarker.propTypes = {
  position: PropTypes.shape({
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
  }),
  title: PropTypes.string,
};

function ClickableMap({ onLocationChange, locationInfo }) {
  let generalLocation = null;
  let generalLocationName = null;
  let preciseLocation = null;

  if (locationInfo) {
    ({ generalLocation, generalLocationName, preciseLocation } = locationInfo);
  }
  // console.log(
  //   'ClickableMap',
  //   generalLocation,
  //   generalLocationName,
  //   preciseLocation,
  // );
  const classes = useStyles();
  const { showSuccess, showError } = useNotifications();
  const [map, setMap] = useState(null);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [currentPlaceLabel, setCurrentPlaceLabel] = React.useState('');

  async function setLocation(location) {
    const scrambledLocation = scrambleLocation(location, 300); // Roughly within 1,000 feet.
    // Detect locality
    try {
      const response = await reverseGeocode(
        location.latitude,
        location.longitude,
      );
      if (response.status === window.google.maps.GeocoderStatus.ZERO_RESULTS) {
        showError('Could not find the locality.');
        return;
      }
      const [result] = response.results;

      // Find city and state.
      let locality = null;
      let administrativeAreaLevel1 = null;
      let administrativeAreaLevel3 = null;
      result.address_components.forEach((addressComp) => {
        if (addressComp.types.indexOf('locality') !== -1) {
          locality = addressComp.long_name;
        }
        if (addressComp.types.indexOf('administrative_area_level_1') !== -1) {
          administrativeAreaLevel1 = addressComp.short_name;
        }
        if (addressComp.types.indexOf('administrative_area_level_3') !== -1) {
          administrativeAreaLevel3 = addressComp.short_name;
        }
      });

      const city = locality || administrativeAreaLevel3;
      let locationName = `${city}, ${administrativeAreaLevel1}`;
      if (!city) {
        locationName = administrativeAreaLevel1;
      }

      // console.log(result);
      // console.log(locality, administrative_area_level_1);

      onLocationChange({
        generalLocation: scrambledLocation,
        generalLocationName: locationName,
        preciseLocation: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        lookedUpAddress: result,
      });
      // setMarkerLocation(location);
    } catch (err) {
      console.error(`Error detecting locality: ${err.message}`, err); // eslint-disable-line no-console
      showError(err.message);
      throw err;
    }
  }

  function handleLocationClick(args) {
    const newLoc = {
      latitude: args.latLng.lat(),
      longitude: args.latLng.lng(),
    };
    // console.log("handle click", args);
    // console.log("handle click", newLoc);
    setLocation(newLoc);
  }

  function handleDetectLocation() {
    setDetectingLocation(true);
    if (!navigator.geolocation) {
      showError(
        'Sorry, your browser does not support detecting your location.',
      );
      setDetectingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        map.panTo({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        map.setZoom(15);
        setLocation(loc);
        showSuccess('Location detected');
        setDetectingLocation(false);
      },
      (err) => {
        // eslint-disable-next-line no-console
        console.log(err);
        showError(
          `Unable to retrieve your location, please click on your location manually.`,
        );
        setDetectingLocation(false);
      },
    );
  }

  function onGoogleMapLoad(googleMap) {
    setMap(googleMap);
    if (generalLocation) {
      googleMap.panTo({
        lat: generalLocation.latitude,
        lng: generalLocation.longitude,
      });
    } else {
      googleMap.panTo({
        lat: DEFAULT_LATITUDE,
        lng: DEFAULT_LONGITUDE,
      });
    }
  }

  function handlePlaceChange(address) {
    setCurrentPlaceLabel(address);
  }

  // function handlePlaceSelect(_event, selection) {
  //   if (!selection) return;

  //   geocodeByAddress(selection.description)
  //     .then((results) => getLatLng(results[0]))
  //     .then((latLng) => {
  //       map.setZoom(15);
  //       setLocation({ latitude: latLng.lat, longitude: latLng.lng });
  //     })
  //     .catch((error) => {
  //       showError('Failed to get the location from address.');
  //       // eslint-disable-next-line no-console
  //       console.error('Error', error);
  //     });
  // }

  async function handlePlaceSelect(_event, selection) {
    if (!selection) return;
    try {
      const [address] = await geocodeByAddress(selection.description);
      const loc = await getLatLng(address);
      map.setZoom(15);
      map.panTo(loc);
      setLocation({ latitude: loc.lat, longitude: loc.lng });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to get the location from address:', err.message);
      showError('Failed to get the location from address.');
      Sentry.captureException(err);
    }
  }

  return (
    <LoadScript
      id="script-loader"
      libraries={USED_GOOGLE_MAPS_LIBRARIES}
      googleMapsApiKey={process.env.REACT_APP_FIREBASE_API_KEY}>
      <Backdrop
        open={detectingLocation}
        className={classes.backdrop}
        color="inherit">
        <CircularProgress
          color="inherit"
          size="2em"
          className={classes.progress}
        />
        <Typography variant="h5" gutterBottom color="inherit" display="block">
          Detecting Location...
        </Typography>
      </Backdrop>
      <div className={classes.entryOptions}>
        <PlacesAutocomplete
          value={currentPlaceLabel}
          onChange={handlePlaceChange}>
          {({ getInputProps, suggestions, loading }) => (
            <>
              {/* {console.log(suggestions)} */}
              <Autocomplete
                data-test="places-autocomplete"
                className={classes.autocomplete}
                onChange={handlePlaceSelect}
                options={suggestions}
                loading={loading}
                getOptionLabel={(sug) => sug.description}
                noOptionsText="No matches"
                renderInput={(params) => (
                  <TextField
                    className={classes.autocompleteInputContainer}
                    data-test="address-entry"
                    {...getInputProps({
                      ...params,
                      placeholder: 'Enter Address',
                    })}
                    InputProps={{
                      ...params.InputProps,
                      className: classes.autocompleteInput,
                      endAdornment: loading && (
                        <CircularProgress color="inherit" size={20} />
                      ),
                    }}
                  />
                )}
              />
            </>
          )}
        </PlacesAutocomplete>
        <div className={classes.entryOptionsSeparator}>
          <Typography>- OR -</Typography>
        </div>
        <Button
          size="small"
          variant="outlined"
          onClick={handleDetectLocation}
          startIcon={<DetectLocationIcon fontSize="small" />}
          className={classes.detectButton}>
          Detect Location
        </Button>
      </div>
      <GoogleMap
        onLoad={onGoogleMapLoad}
        mapContainerClassName={classes.map}
        zoom={4}
        options={{ streetViewControl: false, mapTypeControl: false }}
        onClick={handleLocationClick}>
        {preciseLocation && (
          <SelectedLocationMarker
            position={preciseLocation}
            title={generalLocationName}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
}

ClickableMap.propTypes = {
  onLocationChange: PropTypes.func.isRequired,
  locationInfo: PropTypes.shape({
    generalLocation: PropTypes.shape({
      latitude: PropTypes.number.isRequired,
      longitude: PropTypes.number.isRequired,
    }),
    generalLocationName: PropTypes.string,
    preciseLocation: PropTypes.shape({
      latitude: PropTypes.number.isRequired,
      longitude: PropTypes.number.isRequired,
    }),
    // If the user enters an address then this will be populated with the entry.
    lookedUpAddress: PropTypes.object,
  }),
};

export default ClickableMap;
