import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { SuspenseWithPerf } from 'reactfire';
import LoadingSpinner from 'components/LoadingSpinner';
import AnalyticsPageViewLogger from 'components/AnalyticsPageViewLogger';
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
import UserProfileRoute from './UserProfile';
import SearchRoute from './Search';
import NotFoundRoute from './NotFound';
import PrivacyPolicyRoute from './PrivacyPolicy';
import TermsOfServiceRoute from './TermsOfService';
import RequestSuccessfulRoute from './RequestSuccessful';
import MyRequestsRoute from './MyRequests';
import NewRequestRoute from './NewRequest';
import BlogPageRoute from './Blog';
import LogoutRoute from './Logout';
import SinglePostPageRoute from './SinglePost';

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
              UserProfileRoute,
              AboutRoute,
              LoginRoute,
              TermsOfServiceRoute,
              PrivacyPolicyRoute,
              RequestSuccessfulRoute,
              NewRequestRoute,
              MyRequestsRoute,
              SinglePostPageRoute,
              BlogPageRoute,
              LogoutRoute,
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
          <SuspenseWithPerf traceId="page-view-logger">
            <AnalyticsPageViewLogger />
          </SuspenseWithPerf>
        </Switch>
      </SuspenseWithPerf>
    </CoreLayout>
  );
}
