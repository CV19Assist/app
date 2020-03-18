import React, { useEffect, useState } from 'react';
import './App.css';
import { db } from './fire';
import Button from '@material-ui/core/Button';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core';
import { Helmet } from 'react-helmet';
import {
  BrowserRouter as Router, Route, Switch, Link
} from 'react-router-dom';
import Homepage from './components/Homepage';
import SignUp from './components/SignUp';
import PageNotFound from './components/PageNotFound';


const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
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

function App() {
  const classes = useStyles();
  const [message, setMessage] = useState("");

  useEffect(() => {
    db.collection("users").get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
        console.log(doc);
        setMessage(doc.id);
      });
    });
  }, []);

  return (
    <Router>
      <Helmet titleTemplate="%s | CV19 Assist" />
      <div className={classes.root}>
        <CssBaseline />
        <AppBar position="relative">
          <Toolbar>
            {/* <CameraIcon className={classes.icon} /> */}
            {/* <CameraIcon /> */}
            <Typography variant="h6" color="inherit" noWrap>
              <Link to="/" className={classes.headerLink}>CV19 Assist</Link>
            </Typography>
            {/* <Button color="inherit">Login</Button> */}
          </Toolbar>
        </AppBar>
        <main>
          <Switch>
            <Route exact path="/">
              <Homepage />
            </Route>
            <Route exact path="/contact">
              <p>Contact Us</p><p>coming soon...</p>
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
            {"  "}
            {message}
            <a href="https://www.cv19assist.com" target="_blank" rel="noopener noreferrer">CV19Assist.com</a>
          </Typography>
        </footer>
      </div>
    </Router>
  );
}

export default App;
