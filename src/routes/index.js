import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { SuspenseWithPerf } from 'reactfire';
import LoadingSpinner from 'components/LoadingSpinner';
import { PrivateRoute } from 'utils/router';
import CoreLayout from '../layouts/CoreLayout';
import Home from './Home';
import LoginRoute from './Login';
import RequestRoute from './Request';
import ContactRoute from './Contact';
import AboutRoute from './About';
import DonateRoute from './Donate';
import AccountRoute from './Account';
import NewUserRoute from './NewUser';
import SearchRoute from './Search';
import NotFoundRoute from './NotFound';

export default function createRoutes() {
  return (
    <CoreLayout>
      <SuspenseWithPerf fallback={<LoadingSpinner />} traceId="router-wait">
        <Switch>
          <Route exact path={Home.path} component={() => <Home.component />} />
          {
            /* Build Route components from routeSettings */
            [
              AccountRoute,
              RequestRoute,
              DonateRoute,
              ContactRoute,
              SearchRoute,
              NewUserRoute,
              AboutRoute,
              LoginRoute,
              /* Add More Routes Here */
            ].map((settings) =>
              settings.authRequired ? (
                <PrivateRoute key={`Route-${settings.path}`} {...settings} />
              ) : (
                <Route key={`Route-${settings.path}`} {...settings} />
              ),
            )
          }
          <Route component={NotFoundRoute.component} />
        </Switch>
      </SuspenseWithPerf>
    </CoreLayout>
  );
}
