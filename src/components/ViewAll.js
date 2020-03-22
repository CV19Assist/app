import React, { useState } from "react";
import {GoogleMap, withScriptjs, withGoogleMap, Marker, InfoWindow} from "react-google-maps";
import { makeStyles } from '@material-ui/core';
import { useDispatch, useSelector } from "react-redux";
// import * as parksData from "../data/skateboard-parks.json";
import { defaultLngLat } from '../util/defaults';

const useStyles = makeStyles(theme => ({
  heroContent: {
    background: theme.palette.background.paper,
    padding: theme.spacing(8, 0, 6)
  },
  map: {
    display: 'flex',
    flexGrow: 1,
  },
}));

//Setting Map properties and Pins
function Map() {
  const [selectedPark, setSelectedPark] = useState(null);
  const user = useSelector(state => state.get("user"));
  const userProfile = user.get("userProfile");
  console.log(userProfile);
  const userLocation = userProfile && userProfile.get("location");

  const defaultLocation = userLocation ? {lat: userLocation.get("_latitude"), lng: userLocation.get("_longitude")} : defaultLngLat;

  return (
    <GoogleMap defaultZoom={10}
      defaultCenter={defaultLocation}>
      {/* {parksData.features.map((park) => (
       <Marker key={park.properties.PARK_ID} 
          position={{
            lat: park.geometry.coordinates[1],
            lng: park.geometry.coordinates[0]
          }}
          onClick = {() => {
            setSelectedPark(park);  
          }}
          icon={{
            url:'/checkmark.png',
            scaledSize: new window.google.maps.Size(50, 50)
          }}
        />
     ))}  */}

      {/* {selectedPark && (
       <InfoWindow
          position={{
            lat: selectedPark.geometry.coordinates[1],
            lng: selectedPark.geometry.coordinates[0]
          }}
          onCloseClick={() => {
            setSelectedPark(null);
          }}
        >
          <div>
            <h2>
              {selectedPark.properties.NAME}
            </h2>
            <p>
              {selectedPark.properties.DESCRIPTIO}
            </p>
          </div>
       </InfoWindow>
     )} */}
    </GoogleMap>
  );
}

const WrappedMap = withScriptjs(withGoogleMap(Map));

//Setting up Renderer for the Maps
export default function Maps() {
  const classes = useStyles();
  return (
    <div style={{width: '100vw', height: '80vh'}}>
    {/* // <div className={classes.map}> */}
      <WrappedMap
        googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}=&v=3.exp&libraries=geometry,drawing,places`}
        loadingElement={<div style={{ height: "100%" }} />}
        containerElement={<div style={{ height: "100%" }} />}
        mapElement={<div style={{ height: "100%" }} />}
      />
    </div>
  );
}