import React from 'react';
import { useSelector } from 'react-redux';
import { Route, Redirect, Switch } from 'react-router-dom';

import PageNotFound from './PageNotFound';
import Profile from './Profile';
import NewUser from './NewUser';
import Maps from './Maps';
import Volunteer from '../components/Volunteer';
import ViewAll from '../components/ViewAll';
import NeedHelp from './RequestHelp';

function AuthenticatedContainer(props) {
  const user = useSelector(state => state.get("user"));

  if (user.get("isAuthenticated") !== true) {
    return <Redirect to="/login" />;
  }

  if (user.get("userProfile") === null && (props.location.pathname !== "/new-user")) {
    return <Redirect to="/new-user" />;
  }

  return (
    <React.Fragment>
        <main>
          <Switch>
            <Route exact path="/new-user" component={NewUser} />
            <Route exact path="/profile" component={Profile} />
            <Route exact path="/need-help" component={NeedHelp} />
            <Route path={["/volunteer", "/need-help"]}>
              {!user.get("isAuthenticated") ? (<Redirect to="/login" />) : ( <ViewAll />)}
            </Route>
            <Route exact path="/contact">
              <p>Contact Us</p>
              <p>coming soon...</p>
            </Route>
            <Route exact path="/maps" component={Maps} />

            {/* TODO: Need to figure out how to allow anonymous user to access this. */}
            <Route component={PageNotFound} />
          </Switch>
        </main>
    </React.Fragment>
  );
}

export default AuthenticatedContainer;