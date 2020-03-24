import { GoogleMap, withScriptjs, withGoogleMap, Marker} from "react-google-maps";
import React, { useState } from "react";
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  detectButton: {
    margin: theme.spacing(2)
  },
}));

function Map(props) {
  const [map, setMap] = useState(null);
  const [lastMarker, setLastMarker] = useState(null);

  if (
    props.markerLocation !== null &&
    (lastMarker == null ||
      (props.markerLocation.lat !== lastMarker.lat &&
        props.markerLocation.lng !== lastMarker.lng)) &&
    map
  ) {
    setLastMarker(props.markerLocation);
    map.panTo(props.markerLocation);
  }

  const handleMapMounted = map => {
    setMap(map);
  };

  const handleLocationClick = args => {
    const newLoc = { lat: args.latLng.lat(), lng: args.latLng.lng() };
    props.onSetMarkerLocation(newLoc);
    props.setShowMarker(true);
  };

  return (
    <GoogleMap
      defaultZoom={10}
      defaultCenter={{ lat: 43, lng: -89.4 }}
      ref={handleMapMounted}
      zoomOnClick={true}
      onClick={handleLocationClick}
    >
      {props.markerLocation && (
        <Marker
          position={{
            lat: props.markerLocation.lat,
            lng: props.markerLocation.lng
          }}
        />
      )}
    </GoogleMap>
  );
}

const WrappedMap = withScriptjs(withGoogleMap(Map));

export default function Location(props) {
  const classes = useStyles();
  const [detectionStatus, setDetectionStatus] = useState("");
  const [showMarker, setShowMarker] = useState(false);
  const [markerLocation, setMarkerLocation] = useState(null);

  const handleMarkerLocationChange = location => {
    setMarkerLocation(location);
    setShowMarker(true);
    props.onLocationChange({
      _latitude: location.lat,
      _longitude: location.lng
    });
  };

  const handleDetectLocation = () => {
    setDetectionStatus("Checking capability...");
    if (!navigator.geolocation) {
      alert("Sorry, your browser does not support detecting your location.");
      setDetectionStatus("Failed, location detection not supported.");
      return;
    }

    setDetectionStatus(
      <React.Fragment>
        <CircularProgress size={25} />{" "}
        Locating...
      </React.Fragment>
    );
    navigator.geolocation.getCurrentPosition(
      position => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        handleMarkerLocationChange(loc);
        setDetectionStatus(`Location detected.`);
      },
      () => {
        alert("Unable to retrieve your location.");
        setDetectionStatus("Unable to retrieve your location, please click manually.");
      }
    );
  };

  return (
    <div>
      <div style={{ height: "50vh" }}>
        <WrappedMap
          onLocationChange={props.onLocationChange}
          showMarker={showMarker}
          setShowMarker={setShowMarker}
          markerLocation={markerLocation}
          onSetMarkerLocation={handleMarkerLocationChange}
          googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&v=3.exp&libraries=geometry,drawing,places`}
          loadingElement={<div style={{ height: "100%" }} />}
          containerElement={<div style={{ height: "100%" }} />}
          mapElement={<div style={{ height: "100%" }} />}
        />
      </div>
      <Button
        variant="outlined"
        onClick={handleDetectLocation}
        className={classes.detectButton}
      >
        Detect Location
      </Button>
      {detectionStatus}
    </div>
  );
}