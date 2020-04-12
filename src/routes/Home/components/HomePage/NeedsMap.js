import React from 'react';
import { makeStyles } from '@material-ui/core';
import {
  GoogleMap,
  LoadScript,
  MarkerClusterer,
  Marker,
} from '@react-google-maps/api';
// import { useFirestore, useFirestoreCollection } from 'reactfire';
// import { getGeofirestore } from 'utils/geofirestore';
// import { REQUESTS_PUBLIC_COLLECTION } from 'constants/collections';
import styles from './NeedsMap.styles';

const useStyles = makeStyles(styles);

function NeedsMap() {
  const classes = useStyles();
  // const firestore = useFirestore();
  // const geofirestore = getGeofirestore(firestore);
  // const unfulfilledRequests = useFirestoreCollection(
  //   geofirestore
  //     .collection(REQUESTS_PUBLIC_COLLECTION)
  //     .where('d.status', '==', 1)
  //     .limit(60),
  // );

  const locations = [
    { lat: 43.063881, lng: -89.433003 },
    { lat: 43.63882, lng: -89.443003 },
    { lat: 43.063881, lng: -89.433007 },
    { lat: 43.63882, lng: -89.433006 },
    { lat: 43.063882, lng: -89.433005 },
    { lat: 43.63882, lng: -89.433004 },
  ];

  const options = {
    imagePath:
      'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
  };
  // const options = {};

  return (
    <>
      <LoadScript
        id="script-header"
        googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          id="needs-map"
          mapContainerClassName={classes.needsMap}
          options={{ streetViewControl: false, mapTypeControl: false }}
          zoom={4}
          center={{ lat: 40.318984, lng: -96.960146 }}>
          <MarkerClusterer options={options} maxZoom={11}>
            {(clusterer) =>
              locations.map((location) => (
                <Marker
                  key={`${location.lat}-${location.lng}`}
                  position={location}
                  clusterer={clusterer}
                />
              ))
            }
          </MarkerClusterer>
        </GoogleMap>
      </LoadScript>
    </>
  );
}

export default NeedsMap;
