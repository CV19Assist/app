import React from 'react';
import { makeStyles } from '@material-ui/core';
import { GoogleMap, LoadScript, MarkerClusterer } from '@react-google-maps/api';
import { useFirestore, useFirestoreCollectionData } from 'reactfire';
import { REQUESTS_PUBLIC_COLLECTION } from 'constants/collections';
import MapMarker from './MapMarker';
import styles from './RequestsMap.styles';

const useStyles = makeStyles(styles);

function NeedsMap() {
  const classes = useStyles();
  const firestore = useFirestore();
  const unfulfilledRequests = useFirestoreCollectionData(
    firestore
      .collection(REQUESTS_PUBLIC_COLLECTION)
      .where('d.status', '==', 1)
      .limit(60),
    { idField: 'id' },
  );

  const options = {
    imagePath:
      'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
  };

  return (
    <>
      <LoadScript
        id="script-header"
        googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          id="requests-map"
          mapContainerClassName={classes.requestsMap}
          options={{ streetViewControl: false, mapTypeControl: false }}
          zoom={4}
          center={{ lat: 40.318984, lng: -96.960146 }}>
          <MarkerClusterer options={options} maxZoom={11}>
            {(clusterer) =>
              unfulfilledRequests.map((request) => (
                <MapMarker
                  request={request}
                  key={`${request.id}`}
                  position={{
                    lat: request.d.coordinates.latitude,
                    lng: request.d.coordinates.longitude,
                  }}
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
