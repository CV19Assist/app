import React from 'react';
import { useSelector } from 'react-redux';
import { Route, Redirect, Switch } from 'react-router-dom';

import PageNotFound from './PageNotFound';
import Profile from './Profile';
import NewUser from './NewUser';
// import Maps from './Maps';
// import Volunteer from '../components/Volunteer';
import SearchResults from '../components/SearchResults';
import TaskRequestDialog from '../components/TaskRequestDialog';
// import ViewAll from '../components/ViewAll';

function AuthenticatedContainer(props) {
  const user = useSelector(state => state.get("user"));

  if (user.get("isAuthenticated") !== true) {
    return <Redirect to="/login" />;
  }

  // Allow new user for users without a profile.
  if (
    user.get("userProfile") === null &&
    props.location.pathname !== "/new-user"
  ) {
    return <Redirect to="/new-user" />;
  }

  return (
    <React.Fragment>
      <Switch>
        <Route exact path="/new-user" component={NewUser} />
        <Route exact path="/profile" component={Profile} />
        <Route path="/volunteer" component={SearchResults} />
        {/* <Route exact path="/maps" component={Maps} /> */}

        {/* TODO: Need to figure out how to allow anonymous user to access this. */}
        <Route component={PageNotFound} />
      </Switch>
      <TaskRequestDialog />
    </React.Fragment>
  );
}

export default AuthenticatedContainer;