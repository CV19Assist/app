import React, { useEffect, useState } from 'react';
import './App.css';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core';
import { Helmet } from 'react-helmet';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter as Router, Route, Redirect, Switch, Link } from 'react-router-dom';
import { getEnvironmentInfo } from './modules/environment';
import { initializeUserAuth } from './modules/auth';
import { firebase } from './firebase';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Button from '@material-ui/core/Button';

import Homepage from './components/Homepage';
import SignUp from './components/SignUp';
import PageNotFound from './components/PageNotFound';
import Profile from './components/Profile';
import NewUser from './components/NewUser';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  grow: { flexGrow: 1 },
  headerLink: {
    color: theme.palette.primary.contrastText,
    textDecoration: 'none'
  },
  footer: {
    backgroundColor: theme.palette.background.paper,
    marginTop: 'auto',
    padding: theme.spacing(6),
  },
}));

function App(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const environment = useSelector(state => state.get("environment"));
  const user = useSelector(state => state.get("user"));
  const [firebaseAuthLoaded, setFirebaseAuthLoaded] = useState(false);

  useEffect(() => {
    dispatch(getEnvironmentInfo());
    firebase.auth().onAuthStateChanged(user => {
      if (firebase.auth().currentUser) {
        dispatch(initializeUserAuth());
      }
      setFirebaseAuthLoaded(true);
    });
  }, [dispatch]);

  if (!firebaseAuthLoaded) {
    return (
      <p>Loading...</p>
    );
  }

  return (
    <Router>
      <Helmet titleTemplate="%s | CV19 Assist" />
      <CssBaseline />

      <div className={classes.root}>
        <AppBar position="relative">
          <Toolbar>
            <Typography variant="h6" color="inherit" noWrap>
              <Link to="/" className={classes.headerLink}>
                CV19 Assist
              </Link>
            </Typography>
            <div className={classes.grow} />
            {user.get("isAuthenticated") === true && (
              <Button
                startIcon={<AccountCircle />}
                edge="end"
                color="inherit"
                component={Link}
                to="/profile"
              >
                {user.get("currentUser").displayName}
              </Button>
            )}
          </Toolbar>
        </AppBar>

        <main>
          <Switch>
            <Route exact path="/">
              <Homepage />
            </Route>
            <Route exact path="/new-user">
              <NewUser />
            </Route>
            <PrivateRoute exact path="/profile">
              <Profile />
            </PrivateRoute>
            <Route exact path="/contact">
              <p>Contact Us</p>
              <p>coming soon...</p>
            </Route>
            <Route path={["/volunteer", "/need-help"]}>
              <SignUp />
            </Route>
            <Route>
              <PageNotFound />
            </Route>
          </Switch>
        </main>

        <footer className={classes.footer}>
          <Typography variant="body2" color="textSecondary" align="center">
            {"Copyright © "}
            {new Date().getFullYear()}
            {` ${environment.get("abbreviation")} `}
            <a
              href="https://www.cv19assist.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              CV19Assist.com
            </a>
          </Typography>
        </footer>
      </div>
    </Router>
  );
}

function PrivateRoute({ children, ...rest }) {
  const user = useSelector(state => state.get("user"));

  return (
    <Route
      {...rest}
      render={({ location }) =>
        user.get("isAuthenticated") ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: location }
            }}
          />
        )
      }
    />
  );
}

export default App;