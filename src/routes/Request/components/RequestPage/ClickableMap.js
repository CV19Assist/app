import {
  GoogleMap,
  LoadScript,
  InfoWindow,
  Marker,
} from '@react-google-maps/api';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import {
  Typography,
  Button,
  CircularProgress,
  Backdrop,
  makeStyles,
} from '@material-ui/core';

import { useNotifications } from 'modules/notification';
import Geocode from 'react-geocode';
import styles from './ClickableMap.styles';

const useStyles = makeStyles(styles);
Geocode.setApiKey(process.env.REACT_APP_GOOGLE_MAPS_API_KEY);
Geocode.setRegion('us');

// Based on https://stackoverflow.com/a/31280435/391230
function scrambleLocation(center, radiusInMeters) {
  const y0 = center.lat;
  const x0 = center.lng;
  const rd = radiusInMeters / 111300; // about 111300 meters in one degree

  const u = Math.random();
  const v = Math.random();

  const w = rd * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const x = w * Math.cos(t);
  const y = w * Math.sin(t);

  // Adjust the x-coordinate for the shrinking of the east-west distances
  const xp = x / Math.cos(y0);

  const newlat = y + y0;
  const newlon2 = xp + x0;

  return {
    lat: Math.round(newlat * 1e5) / 1e5,
    lng: Math.round(newlon2 * 1e5) / 1e5,
  };
}

function ClickableMap(props) {
  const classes = useStyles();
  const [map, setMap] = useState(null);
  const { showSuccess, showError } = useNotifications();
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [markerLocation, setMarkerLocation] = useState(null);
  const [generalLocationName, setGeneralLocationName] = useState('');

  const setLocation = async (location) => {
    // console.log("called", location);
    if (map) {
      // console.log("center", location);
      // map.panTo(location);
      // TODO: Figure out how to properly zoom and pan.
      // if (map.getZoom() < 10) {
      //   map.setZoom(10);
      // }
    }

    const scrambledLocation = scrambleLocation(location, 300); // Roughly within 1,000 feet.

    // Detect locality.
    try {
      const response = await Geocode.fromLatLng(location.lat, location.lng);
      if (response.status === 'ZERO_RESULTS') {
        showError('Could not find the locality.');
        return;
      }
      if (response.status !== 'OK') {
        showError(`Geocoding error: ${response.status}`);
        return;
      }
      const result = response.results[0];

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

      props.onLocationChange({
        generalLocation: scrambledLocation,
        generalLocationName: locationName,
        preciseLocation: {
          _latitude: location.lat,
          _longitude: location.lng,
        },
      });
      setMarkerLocation(location);
    } catch (err) {
      showError(err);
    }
  };

  const handleLocationClick = (args) => {
    const newLoc = { lat: args.latLng.lat(), lng: args.latLng.lng() };
    // console.log("handle click", args);
    // console.log("handle click", newLoc);
    setLocation(newLoc);
  };

  const handleDetectLocation = () => {
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
  };

  return (
    <>
      <LoadScript
        id="script-loader"
        googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
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
