import React from "react";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid"
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import { FirebaseAuth, getAuthConfig } from "../firebase_auth";
import { useDispatch, useSelector } from "react-redux";
import { userLoggedIn } from "../modules/auth";
import { useHistory } from "react-router";
import { Redirect } from "react-router-dom";
import { useFormik } from "formik";

const useStyles = makeStyles(theme => ({
  heroContent: {
    background: theme.palette.background.paper,
    padding: theme.spacing(8, 0, 6)
  },
  heroButtons: {
    marginTop: theme.spacing(4)
  }
}));

const NewUserForm = () => {
  const formik = useFormik({
    initialValues: {
      first: '',
      last: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      zip: '',
      email: '',
      phone: '',
    },
  });
  return (
    <form>
      <Container maxWidth="sm">
        <Grid container spacing={3}>
          <Grid item xs>
            <TextField
              id="first"
              name="first"
              type="text"
              label="First Name"
              variant="outlined"
              fullWidth
              onChange={formik.handleChange}
              value={formik.values.first}
            />
          </Grid>
          <Grid item xs>
            <TextField
              id="last"
              name="last"
              type="text"
              label="Last Name"
              variant="outlined"
              fullWidth
              onChange={formik.handleChange}
              value={formik.values.last}
            />
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs>
            <TextField
              id="address1"
              name="address1"
              type="text"
              label="Street 1"
              variant="outlined"
              fullWidth
              onChange={formik.handleChange}
              value={formik.values.address1}
            />
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs>
            <TextField
              id="address2"
              name="address2"
              type="text"
              label="Street 2"
              variant="outlined"
              fullWidth
              onChange={formik.handleChange}
              value={formik.values.address2}
            />
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <TextField
              id="city"
              name="city"
              type="text"
              label="City"
              variant="outlined"
              fullWidth
              onChange={formik.handleChange}
              value={formik.values.city}
            />
          </Grid>
          <Grid item xs>
            <TextField
              id="state"
              name="state"
              type="text"
              label="State"
              variant="outlined"
              fullWidth
              onChange={formik.handleChange}
              value={formik.values.state}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              id="zip"
              name="zip"
              type="text"
              label="Zip"
              variant="outlined"
              fullWidth
              onChange={formik.handleChange}
              value={formik.values.zip}
            />
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={8}>
            <TextField
              id="email"
              name="email"
              type="email"
              label="E-Mail"
              variant="outlined"
              fullWidth
              onChange={formik.handleChange}
              value={formik.values.email}
            />
          </Grid>
          <Grid item xs>
            <TextField
              id="phone"
              name="phone"
              type="tel"
              label="Phone"
              variant="outlined"
              fullWidth
              onChange={formik.handleChange}
              value={formik.values.phone}
            />
          </Grid>
        </Grid>
      </Container>
    </form>
  );
};

function NewUser() {
  const classes = useStyles();
  const history = useHistory();
  const user = useSelector(state => state.get("user"));

  if (user.get("isAuthenticated") === true) {
    return (
      // <Redirect to="/" />
      <p>Already logged in, skip this step.</p>
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
              variant="h5"
              align="center"
              color="textSecondary"
              paragraph
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </Typography>
            <NewUserForm />
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