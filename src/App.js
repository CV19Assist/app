import React, { useEffect } from 'react';
import { CssBaseline, Paper, CircularProgress, Container, Typography } from '@material-ui/core';
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
import Blog from './components/blog.js'; 

const useStyles = makeStyles(theme => ({
  grow: { flexGrow: 1 },
  footer: {
    marginTop: 'auto',
    padding: theme.spacing(3),
  },
  loadingContainer: {
    display: 'flex',
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingPaper: {
    flexGrow: 1,
    padding: theme.spacing(3),
    textAlign: "center",
  },
  loadingSpinner: {
    margin: theme.spacing(2)
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
    dispatch(
      cacheLaunchURL(`${location.pathname}${location.search}${location.hash}`)
    );
    firebase.auth().onAuthStateChanged(user => {
      dispatch(initializeUserAuth());
    });
  }, [dispatch]);

  // Don't render anything until firebase auth is fully initialized.
  if (user.get("isInitialized") !== true) {
    return (
      <Container maxWidth="sm" className={classes.loadingContainer}>
        <CssBaseline />
        <Paper className={classes.loadingPaper}>
          <CircularProgress className={classes.loadingSpinner} />
          <Typography variant="h6" noWrap>
            Loading CV19 Assist...
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <React.Fragment>
      <Helmet titleTemplate="%s | CV19 Assist" />
      <CssBaseline />

      <AppBarAndDrawer user={user} />

      <Container maxWidth={false} disableGutters>
        <main>
          <Switch>
            <Route exact path="/" component={Homepage} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/logout" component={Logout} />
            <Route exact path="/about" component={AboutPage} />
            <Route exact path="/request" component={RequestHelp} />
            <Route exact path="/blog" component={Blog} />
            <Route
              exact
              path="/request-successful"
              component={RequestSuccessful}
            />
            <Route exact path="/needs/:id" component={NeedDetails} />
            <Refresh path="/refresh" />

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
    </React.Fragment>
  );
}

export default App;