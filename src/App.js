import React, { useEffect } from 'react';
import './App.css';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core';
import { Helmet } from 'react-helmet';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Switch, useLocation } from 'react-router-dom';
import { getEnvironmentInfo } from './modules/environment';
import { initializeUserAuth, cacheLaunchURL } from './modules/user';
import { firebase } from './firebase';

// Pages
import Homepage from './components/Homepage';
import Refresh from './components/Refresh';
import Login from './components/Login';
import Logout from './components/Logout';
import RequestHelp from './components/RequestHelp';
import RequestSuccessful from './components/RequestSuccessful';
import AppBarAndDrawer from './components/AppBarAndDrawer';
import AuthenticatedContainer from './components/AuthenticatedContainer';
import { version } from '../package.json';
import AboutPage from './pages/AboutPage';
// import Maps from './components/Maps';
// import Geolocation from './components/Geolocation';
// import MyTasks from './components/MyTasks';
import NeedDetails from './pages/NeedDetailsPage';
import ContactUsPage from './pages/ContactUsPage';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  grow: { flexGrow: 1 },
  footer: {
    // backgroundColor: theme.palette.background.paper,
    marginTop: 'auto',
    padding: theme.spacing(3),
  },
  bodyContainer: {
    paddingBottom: theme.spacing(9),
    marginBlock: theme.spacing(6)
  }
}));

function App(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const location = useLocation();
  const environment = useSelector(state => state.get("environment"));
  const user = useSelector(state => state.get("user"));

  useEffect(() => {
    dispatch(getEnvironmentInfo());
    dispatch(cacheLaunchURL(`${location.pathname}${location.search}${location.hash}`));
    firebase.auth().onAuthStateChanged(user => {
      dispatch(initializeUserAuth());
    });
  }, [dispatch]);

  // Don't render anything until firebase auth is fully initialized.
  if (user.get("isInitialized") !== true) {
    return (
      <React.Fragment>
        <CircularProgress />
        <Typography variant="h6" noWrap>
          Loading...
        </Typography>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <Helmet titleTemplate="%s | CV19 Assist" />
      <CssBaseline />

      <div className={classes.root}>
        <AppBarAndDrawer user={user} />

        {/* <Container className={classes.bodyContainer}> */}
        <Container>
          <main>
            <Switch>
              <Route exact path="/" component={Homepage} />
              <Route exact path="/login" component={Login} />
              <Route exact path="/logout" component={Logout} />
              <Route exact path="/about" component={AboutPage} />
              <Route exact path="/request" component={RequestHelp} />
              <Route
                exact
                path="/request-successful"
                component={RequestSuccessful}
              />
              <Route exact path="/needs/:id" component={NeedDetails} />
              <Refresh path="/refresh"/>

              {/* TODO: Remove temporary routes */}
              {/* <Route exact path="/geo" component={Geolocation} />
              <Route exact path="/myTasks" component={MyTasks} /> */}

              <Route exact path="/contact" component={ContactUsPage} />
              <Route component={AuthenticatedContainer} />
            </Switch>
          </main>
        </Container>

        <footer className={classes.footer}>
          <Typography variant="body2" color="textSecondary" align="center">
            {"Copyright © "}
            <a
              href="https://www.cv19assist.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              CV19Assist.com
            </a>{" "}
            {`${new Date().getFullYear()} - v${version} ${environment.get(
              "abbreviation"
            )}`}
          </Typography>
        </footer>
      </div>
    </React.Fragment>
  );
}

export default App;