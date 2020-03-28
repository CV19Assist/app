import {GoogleMap, withScriptjs, withGoogleMap, Marker} from "react-google-maps";
import React, { useState } from "react";


function Map(props) {
  const [showMarker, setShowMarker] = useState(false);
  const [markerLocation, setMarkerLocation] = useState({lat: 0, lng: 0});

  const handleLocationClick = (args) => {
    setShowMarker(true);
    const newLoc = {lat: args.latLng.lat(), lng: args.latLng.lng()};
    setMarkerLocation(newLoc);
    props.onLocationChange({ _latitude: newLoc.lat, _longitude: newLoc.lng });
  }

  return (
    <GoogleMap
      defaultZoom={10}
      defaultCenter={{ lat: 43, lng: -89.4 }}
      onClick={handleLocationClick}
    >
      {showMarker && (
        <Marker
          position={{
            lat: markerLocation.lat,
            lng: markerLocation.lng
          }}
        />
      )}
    </GoogleMap>
  );
}

const WrappedMap = withScriptjs(withGoogleMap(Map));

export default function Location(props) {
  return (
    <div style={{ height: "50vh" }}>
      <WrappedMap
        onLocationChange={props.onLocationChange}
        googleMapURL={
          `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&v=3.exp&libraries=geometry,drawing,places`
        }
        loadingElement={<div style={{ height: "100%" }} />}
        containerElement={<div style={{ height: "100%" }} />}
        mapElement={<div style={{ height: "100%" }} />}
      />
    </div>
  );
}