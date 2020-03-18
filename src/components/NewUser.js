import React from "react";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core";
import Container from "@material-ui/core/Container";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import { FirebaseAuth, getAuthConfig } from "../firebase_auth";
import { useDispatch, useSelector } from "react-redux";
import { userLoggedIn } from "../modules/auth";
import { useHistory } from "react-router";
import { Redirect } from "react-router-dom";

const useStyles = makeStyles(theme => ({
  heroContent: {
    background: theme.palette.background.paper,
    padding: theme.spacing(8, 0, 6)
  },
  heroButtons: {
    marginTop: theme.spacing(4)
  }
}));

function NewUser() {
  const classes = useStyles();
  const history = useHistory();
  const user = useSelector(state => state.get("user"));

  if (user.get("isAuthenticated") === true) {
    return (
      <Redirect to="/" />
    );
  }

  const handleSuccessfulLogin = () => {
    history.push("/");
  };

  return (
    <React.Fragment>
      <main>
        <div className={classes.heroContent}>
          <Container maxWidth="md">
            <Typography
              component="h1"
              variant="h2"
              align="center"
              color="textPrimary"
              gutterBottom
            >
              Login
            </Typography>
            <Typography
              variant="h5"
              align="center"
              color="textSecondary"
              paragraph
            >
            </Typography>
            <StyledFirebaseAuth
              uiConfig={getAuthConfig(handleSuccessfulLogin)}
              firebaseAuth={FirebaseAuth()}
            />
          </Container>
        </div>
      </main>
    </React.Fragment>
  );
}

export default NewUser;
