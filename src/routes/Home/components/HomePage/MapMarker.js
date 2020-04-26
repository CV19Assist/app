import React, { useState } from 'react';
import { Link, generatePath } from 'react-router-dom';
import { Marker, InfoWindow } from '@react-google-maps/api';
import PropTypes from 'prop-types';
import { Typography } from '@material-ui/core';
import { allCategoryMap } from 'constants/categories';
import immediacyMap from 'constants/immediacy';
import { format } from 'date-fns';
import { REQUEST_PATH } from 'constants/paths';

function MapMarker({ request, clusterer, position }) {
  const [marker, setMarker] = useState(null);
  const [showInfoWindow, setShowInfoWindow] = useState(false);

  const handleOnLoad = (mapMarker) => {
    setMarker(mapMarker);
  };

  const handleOnClick = () => {
    setShowInfoWindow(!showInfoWindow);
  };

  const renderInfoWindow = (mapMarker) => {
    if (mapMarker === null || request === null || !showInfoWindow) return null;

    // TODO: Remove this once the model has stabilized.
    if (!request || !request.d) return null;

    return (
      <InfoWindow anchor={mapMarker}>
        <div>
          <Typography variant="subtitle2">
            {request.d.firstName} &ndash; {request.d.generalLocationName}
          </Typography>
          <Typography variant="body2">
            {format(request.d.createdAt.toDate(), 'p - PPPP')}
          </Typography>
          <Typography variant="body2">
            Immediacy:{' '}
            {immediacyMap[request.d.immediacy] &&
              immediacyMap[request.d.immediacy].shortDescription}
          </Typography>
          <Typography variant="body2">
            Needs:{' '}
            {request.d.needs.map((key) => allCategoryMap[key].shortDescription)}
          </Typography>
          <Typography variant="subtitle2">
            <Link to={generatePath(REQUEST_PATH, { requestId: request.id })}>
              Details...
            </Link>
          </Typography>
        </div>
      </InfoWindow>
    );
  };

  return (
    <Marker
      clusterer={clusterer}
      position={position}
      onClick={handleOnClick}
      onLoad={handleOnLoad}>
      {renderInfoWindow(marker)}
    </Marker>
  );
}

MapMarker.propTypes = {
  request: PropTypes.object.isRequired,
  clusterer: PropTypes.object.isRequired,
  position: PropTypes.object.isRequired,
};

export default MapMarker;
