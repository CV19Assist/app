import React from "react";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core";
import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";
import Box from "@material-ui/core/Box";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import { FirebaseAuth, getAuthConfig } from "../firebase_auth";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import { Redirect } from "react-router-dom";

const useStyles = makeStyles(theme => ({
}));

function Login() {
  const classes = useStyles();
  const history = useHistory();
  const user = useSelector(state => state.get("user"));

  if (user.get("isAuthenticated") === true) {
    return <Redirect to="/" />;
  }

  const handleSuccessfulLogin = () => {
    history.push("/");
  };

  return (
    <React.Fragment>
      <Container maxWidth="md">
        <Typography
          variant="h4"
          align="center"
          color="textPrimary"
          gutterBottom
        >
          Login or Create Account
        </Typography>
        <Paper>
          <Box p={2}>
            <Typography
              variant="subtitle1"
              align="center"
              color="textSecondary"
              paragraph
            >
              Thank you very much for your interest. Please create an account or
              login by click on a preferred method below.
            </Typography>
            <StyledFirebaseAuth
              uiConfig={getAuthConfig(handleSuccessfulLogin)}
              firebaseAuth={FirebaseAuth()}
            />
          </Box>
        </Paper>
      </Container>
    </React.Fragment>
  );
}

export default Login;
