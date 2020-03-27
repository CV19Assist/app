import React, { useEffect, useState } from 'react';
import './App.css';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/CssBaseline';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core';
import { Helmet } from 'react-helmet';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Switch, Link, useLocation } from 'react-router-dom';
import { getEnvironmentInfo } from './modules/environment';
import { initializeUserAuth, cacheLaunchURL } from './modules/user';
import { firebase } from './firebase';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

// Pages
import Homepage from './components/Homepage';
import Login from './components/Login';
import Logout from './components/Logout';
import RequestHelp from './components/RequestHelp';
import RequestSuccessful from './components/RequestSuccessful';
import AuthenticatedContainer from './components/AuthenticatedContainer';
import { version } from '../package.json';
// import Maps from './components/Maps';
// import Geolocation from './components/Geolocation';
// import MyTasks from './components/MyTasks';
import NeedHelp from './components/RequestHelp';
import NeedDetails from './pages/NeedDetailsPage';

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
    // backgroundColor: theme.palette.background.paper,
    marginTop: 'auto',
    padding: theme.spacing(3),
  },
  appBar: {
    marginBottom: theme.spacing(2)
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
  const environment = useSelector(state => state.get("environment") );
  const user = useSelector(state => state.get("user"));

  const [ profileMenuAnchor, setProfileMenuAnchor ] = useState(null);

  const handleProfileMenuClick = () => {
    setProfileMenuAnchor(null);
  }

  useEffect(() => {
    dispatch(getEnvironmentInfo());
    dispatch(cacheLaunchURL(location.pathname));
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
        <AppBar position="relative" className={classes.appBar}>
          <Toolbar>
            <Typography variant="h6" color="inherit" noWrap>
              <Link to="/" className={classes.headerLink}>
                COVID-19 Assist
              </Link>
            </Typography>
            <div className={classes.grow} />
            <Button color="inherit">Volunteers</Button>
            <Button color="inherit">About Us</Button>
            {!user.get("isAuthenticated") && (
              <Button
                component={Link}
                to="/login"
                color="inherit"
              >
                Login
              </Button>
            )}
            {user.get("isAuthenticated") === true &&
              user.get("userProfile") !== null && (
                <React.Fragment>
                  <Button
                    startIcon={<AccountCircle />}
                    edge="end"
                    color="inherit"
                    onClick={event => setProfileMenuAnchor(event.currentTarget)}
                  >
                    {user.get("userProfile").get("displayName")}
                  </Button>
                  <Menu
                    open={Boolean(profileMenuAnchor)}
                    anchorEl={profileMenuAnchor}
                    onClose={handleProfileMenuClick}
                  >
                    <MenuItem
                      component={Link}
                      to="/profile/tasks"
                      onClick={handleProfileMenuClick}
                    >
                      My Tasks
                    </MenuItem>
                    <MenuItem
                      component={Link}
                      to="/profile"
                      onClick={handleProfileMenuClick}
                    >
                      Profile
                    </MenuItem>
                    {/* <MenuItem component={Link} to="/tasks" onClick={handleProfileMenuClick}>My Tasks</MenuItem> */}
                    <MenuItem
                      component={Link}
                      to="/logout"
                      onClick={handleProfileMenuClick}
                    >
                      Logout
                    </MenuItem>
                  </Menu>
                </React.Fragment>
              )}
          </Toolbar>
        </AppBar>

        <Container classes={classes.bodyContainer}>
          <main>
            <Switch>
              <Route exact path="/" component={Homepage} />
              <Route exact path="/login" component={Login} />
              <Route exact path="/logout" component={Logout} />
              <Route exact path="/request" component={RequestHelp} />
              <Route exact path="/need-help" component={NeedHelp} />
              <Route
                exact
                path="/request-successful"
                component={RequestSuccessful}
              />
              <Route exact path="/needs/:id" component={NeedDetails} />

              {/* TODO: Remove temporary routes */}
              {/* <Route exact path="/geo" component={Geolocation} />
              <Route exact path="/myTasks" component={MyTasks} /> */}

              <Route exact path="/contact">
                <p>Contact Us</p>
                <p>coming soon...</p>
              </Route>
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
            >CV19Assist.com</a>{" "}
            {`${new Date().getFullYear()} - v${version} ${environment.get("abbreviation")}`}
          </Typography>
        </footer>
      </div>
    </React.Fragment>
  );
}

export default App;