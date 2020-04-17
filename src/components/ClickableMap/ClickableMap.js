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

function ClickableMap({ onLocationChange }) {
  const classes = useStyles();
  const [map, setMap] = useState(null);
  const { showSuccess, showError } = useNotifications();
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [markerLocation, setMarkerLocation] = useState(null);
  const [generalLocationName, setGeneralLocationName] = useState('');

  async function setLocation(location) {
    // console.log('setLocation called:', location);
    if (map) {
      //   console.log("center", location);
      //   map.panTo(location);
      //   // TODO: Figure out how to properly zoom and pan.
      //   if (map.getZoom() < 10) {
      //     map.setZoom(10);
      //   }
    }

    const scrambledLocation = scrambleLocation(location, 300); // Roughly within 1,000 feet.
    // Detect locality
    try {
      Geocode.setApiKey(process.env.REACT_APP_FIREBASE_API_KEY);
      Geocode.setRegion('us');
      const response = await Geocode.fromLatLng(location.lat, location.lng);
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

      setGeneralLocationName(locationName);
      // console.log(result);
      // console.log(locality, administrative_area_level_1);

      onLocationChange({
        generalLocation: scrambledLocation,
        generalLocationName: locationName,
        preciseLocation: {
          _latitude: location.lat,
          _longitude: location.lng,
        },
      });
      setMarkerLocation(location);
    } catch (err) {
      console.error(`Error detecting locality: ${err.message}`, err); // eslint-disable-line no-console
      showError(err.message);
      throw err;
    }
  }

  function handleLocationClick(args) {
    const newLoc = { lat: args.latLng.lat(), lng: args.latLng.lng() };
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
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setLocation(loc);
        showSuccess('Location detected');
        setDetectingLocation(false);
      },
      () => {
        showError(
          'Unable to retrieve your location, please click on your location manually.',
        );
        setDetectingLocation(false);
      },
    );
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
          onLoad={(googleMap) => {
            setMap(googleMap);
          }}
          mapContainerClassName={classes.map}
          center={{ lat: 40.318984, lng: -96.960146 }}
          zoom={4}
          options={{ streetViewControl: false, mapTypeControl: false }}
          onClick={handleLocationClick}>
          {markerLocation && (
            <>
              <Marker
                position={{
                  lat: markerLocation.lat,
                  lng: markerLocation.lng,
                }}
              />
              (
              <InfoWindow
                // TODO: Figure out how to anchor with the map marker.
                position={{
                  lat: markerLocation.lat,
                  lng: markerLocation.lng,
                }}>
                <div className={classes.infobox}>{generalLocationName}</div>
              </InfoWindow>
              )
            </>
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
};

export default ClickableMap;
