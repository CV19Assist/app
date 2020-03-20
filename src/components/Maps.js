import React, { useState } from "react";
import {GoogleMap, withScriptjs, withGoogleMap, Marker, InfoWindow} from "react-google-maps";
import * as parksData from "../data/skateboard-parks.json";
import mapStyles from "./mapStyles";

//Setting Map properties and Pins
function Map(){

const [selectedPark, setSelectedPark] = useState(null);

  return(
    <GoogleMap 
      defaultZoom={10} 
      defaultCenter={{lat:45, lng: -75}}
      defaultOptions={{styles: mapStyles}}
    >
     {parksData.features.map((park) => (
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
     ))} 

     {selectedPark && (
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
     )}

    </GoogleMap>
  );
}

const WrappedMap = withScriptjs(withGoogleMap(Map));

//Setting up Renderer for the Maps
export default function Maps(){
  return (
    <div style={{width: '100vw', height: '100vh'}}>
      <WrappedMap googleMapURL={
        'https://maps.googleapis.com/maps/api/js?key=AIzaSyC4R6AN7SmujjPUIGKdyao2Kqitzr1kiRg&v=3.exp&libraries=geometry,drawing,places&key=AIzaSyAu_GmjA0S6RlY9DnuOWoYjbZBPrIC0Jag'
        } 
        loadingElement={<div style={{height:"100%"}} />}
        containerElement={<div style={{height:"100%"}} />}
        mapElement={<div style={{height:"100%"}} />}
        />
    </div>
    );
}