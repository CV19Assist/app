import React, { useState } from 'react';
import { Link, generatePath } from 'react-router-dom';
import { Marker, InfoWindow } from '@react-google-maps/api';
import PropTypes from 'prop-types';
import { makeStyles, Button, Typography, Divider } from '@material-ui/core';
import { allCategoryMap } from 'constants/categories';
import immediacyMap from 'constants/immediacy';
import { format } from 'date-fns';
import { REQUEST_PATH } from 'constants/paths';
import styles from './MapMarker.styles';

const useStyles = makeStyles(styles);

function MapMarker(props) {
  const classes = useStyles();
  const { request, clusterer, position } = props;
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
          <Divider className={classes.divider} />
          <Button
            variant="outlined"
            size="small"
            color="primary"
            component={Link}
            to={generatePath(REQUEST_PATH, { requestId: request.id })}>
            Details...
          </Button>
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
