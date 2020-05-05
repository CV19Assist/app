import React from 'react';
import { Typography, makeStyles } from '@material-ui/core';
import { GoogleMap, LoadScript, MarkerClusterer } from '@react-google-maps/api';
import { useFirestore, useFirestoreCollectionData } from 'reactfire';
import { REQUESTS_PUBLIC_COLLECTION } from 'constants/collections';
import MapMarker from './MapMarker';
import styles from './RequestsMap.styles';

const useStyles = makeStyles(styles);

// A random location to get the US map to center.
const centeralUS = { lat: 40.318984, lng: -96.960146 };

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
      {unfulfilledRequests.length === 0 ? (
        <Typography variant="body2" gutterBottom>
          Currently, there are no open requests. Please help spread the word
          about this volunteer service so we can help more people!
        </Typography>
      ) : (
        <Typography variant="body2" gutterBottom>
          Below are a few of the currently open requests. If you are in the area
          with or know of someone there, please help spread the word and refer
          them to this site.
        </Typography>
      )}

      <LoadScript
        id="script-header"
        googleMapsApiKey={process.env.REACT_APP_FIREBASE_API_KEY}>
        <GoogleMap
          id="requests-map"
          mapContainerClassName={classes.requestsMap}
          options={{ streetViewControl: false, mapTypeControl: false }}
          zoom={4}
          center={centeralUS}>
          <MarkerClusterer options={options} maxZoom={11}>
            {(clusterer) =>
              unfulfilledRequests.map((request) => (
                <MapMarker
                  request={request}
                  key={`${request.id}`}
                  position={{
                    lat: request.d.generalLocation.latitude,
                    lng: request.d.generalLocation.longitude,
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
