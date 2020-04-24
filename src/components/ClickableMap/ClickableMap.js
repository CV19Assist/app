import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Geocode from 'react-geocode';
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
  makeStyles,
} from '@material-ui/core';
import { useNotifications } from 'modules/notification';
import { scrambleLocation } from 'utils/geo';
import styles from './ClickableMap.styles';

const useStyles = makeStyles(styles);
Geocode.setApiKey(process.env.REACT_APP_FIREBASE_API_KEY);
Geocode.setRegion('us');

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

function ClickableMap({
  onLocationChange,
  locationInfo: { generalLocation, generalLocationName, preciseLocation },
}) {
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

  async function setLocation(location) {
    const scrambledLocation = scrambleLocation(location, 300); // Roughly within 1,000 feet.
    // Detect locality
    try {
      const response = await Geocode.fromLatLng(
        location.latitude,
        location.longitude,
      );
      if (response.status === 'ZERO_RESULTS') {
        showError('Could not find the locality.');
        return;
      }
      if (response.status !== 'OK') {
        showError(`Geocoding error: ${response.status}`);
        return;
      }
      const [result] = response.results;

      // Find city and state.
      let locality = null;
      let administrativeAreaLevel1 = null;
      result.address_components.forEach((addressComp) => {
        if (addressComp.types.indexOf('locality') !== -1) {
          locality = addressComp.long_name;
        }
        if (addressComp.types.indexOf('administrative_area_level_1') !== -1) {
          administrativeAreaLevel1 = addressComp.short_name;
        }
      });

      let locationName = `${locality}, ${administrativeAreaLevel1}`;
      if (!locality) {
        locationName = result.formatted_address;
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
    googleMap.panTo({
      lat: generalLocation.latitude,
      lng: generalLocation.longitude,
    });
  }

  return (
    <>
      <LoadScript
        id="script-loader"
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
        <Button
          variant="outlined"
          onClick={handleDetectLocation}
          className={classes.detectButton}>
          Detect Location
        </Button>
        {generalLocationName !== '' && (
          <Typography variant="body2" display="inline">
            General location: {generalLocationName}
          </Typography>
        )}
      </LoadScript>
    </>
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
  }).isRequired,
};

export default ClickableMap;
