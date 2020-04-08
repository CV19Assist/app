import React from 'react';
import { Route } from 'react-router-dom';

// Forced refresh route based on https://github.com/ReactTraining/react-router/issues/4056#issuecomment-350224711
const Refresh = ({ path = '/' }) => (
  <Route
      path={path}
      component={({ history, location, match }) => {
          history.replace({
              ...location,
              pathname:location.pathname.substring(match.path.length)
          });
          return null;
      }}
  />
);

export default Refresh;