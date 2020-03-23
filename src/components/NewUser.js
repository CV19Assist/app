import React, { useState } from "react";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Paper from "@material-ui/core/Paper";
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import { makeStyles } from "@material-ui/core";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid"
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { Formik, Field } from "formik";
import * as Yup from "yup";
import { saveUserProfile } from "../modules/user";
import Location from "./ClickableMap";

const useStyles = makeStyles(theme => ({
  header: {
    marginBottom: theme.spacing(4),
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(3)
  },
  optionalDivider: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
  },
  errorText: {
    color: 'red',
    fontWeight: 'bold',
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(1)
  },
  paper: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(1)
  },
  intro: {
    marginBottom: theme.spacing(2),
  }
}));

const userProfileSchema = Yup.object().shape({
  firstName: Yup.string().min(2, "Too Short").required("Required"),
  lastName: Yup.string().min(2, "Too Short").required("Required"),
  email: Yup.string().email("Please enter a valida email address").required("Required"),
  phone: Yup.string().required("Required"),
  address1: Yup.string(),
  address2: Yup.string(),
  city: Yup.string(),
  state: Yup.string(),
  zipcode: Yup.string(),
});


function NewUser() {
  const dispatch = useDispatch();
  const classes = useStyles();
  const user = useSelector(state => state.get("user"));
  const authUser = user.get("authUser");
  const [userLocation, setUserLocation] = useState(null);

  const splitName = authUser.displayName.split(" ");

  if (user.get("userProfile")) {
    return (
      <Container>
        <Card style={{ minWidth: 275 }}>
          <CardContent>
            <Typography variant="h5" component="h2">
              Profile Exists
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              You are already signed up so you do not have to sign up again.
            </Typography>
          </CardContent>
          <CardActions>
            <Button
              component={Link}
              to="/profile"
              size="small"
              color="primary"
            >
              View Profile
            </Button>
          </CardActions>
        </Card>
      </Container>
    );
  }

  const handleLocationChange = (location) => {
    setUserLocation(location);
  }

  const handleFormSubmit = (values) => {
    if (!userLocation) {
      alert("Please select a location above.");
      return;
    }

    values.coordinates = userLocation;
    dispatch(saveUserProfile(values));
  };

  return (
    <Container maxWidth="md">
      <Paper className={classes.paper}>
        <Typography component="h1" variant="h4" align="center" className={classes.header}>
          Sign Up
        </Typography>

        <Formik
          onSubmit={handleFormSubmit}
          initialValues={{
            firstName: splitName[0],
            lastName: splitName.length > 1 ? splitName[1] : "",
            email: authUser.email || "",
            address1: "",
            address2: "",
            city: "",
            state: "",
            zipcode: "",
            phone: ""
          }}
          validationSchema={userProfileSchema}
        >
          { formik => (
          <form onSubmit={formik.handleSubmit}>
            <Container maxWidth="sm">
              <Typography variant="subtitle2" className={classes.intro}>
                Please complete the following information so we can find matches
                efficiently.
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs>
                  <Field as={TextField}
                    name="firstName"
                    type="text"
                    label="First Name"
                    variant="outlined"
                    fullWidth
                    error={formik.touched.firstName && !!formik.errors.firstName}
                    helperText={formik.errors.firstName}
                  />
                </Grid>
                <Grid item xs>
                  <Field as={TextField}
                    name="lastName"
                    type="text"
                    label="Last Name"
                    variant="outlined"
                    fullWidth
                    error={formik.touched.lastName && !!formik.errors.lastName}
                    helperText={formik.errors.lastName}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Field as={TextField}
                    name="email"
                    type="email"
                    label="E-mail"
                    variant="outlined"
                    fullWidth
                    error={formik.touched.email && !!formik.errors.email}
                    helperText={formik.errors.email}
                  />
                </Grid>
                <Grid item xs>
                  <Field as={TextField}
                    name="phone"
                    type="tel"
                    label="Phone"
                    variant="outlined"
                    fullWidth
                    error={formik.touched.phone && !!formik.errors.phone} helperText={formik.errors.phone}
                  />
                </Grid>
              </Grid>
              <Divider className={classes.optionalDivider} />
              <Typography variant="h6" gutterBottom>
                Please click or tap on your location
              </Typography>
              <Typography variant="body2" className={classes.intro}>
                We do not need a precise location, but we do require a location so we can find matches
                more efficiently.
              </Typography>
              <Card>
                <Location onLocationChange={handleLocationChange} />
              </Card>
              <Divider className={classes.optionalDivider} />
              <Typography variant="h6" gutterBottom>
                Optional &ndash; Address
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs>
                  <Field as={TextField}
                    name="address1"
                    type="text"
                    label="Street 1"
                    variant="outlined"
                    fullWidth
                    error={formik.touched.address1 && !!formik.errors.address1} helperText={formik.errors.address1}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={3}>
                <Grid item xs>
                  <Field as={TextField}
                    name="address2"
                    type="text"
                    label="Street 2"
                    variant="outlined"
                    fullWidth
                    error={formik.touched.address2 && !!formik.errors.address2} helperText={formik.errors.address2}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Field as={TextField}
                    name="city"
                    type="text"
                    label="City"
                    variant="outlined"
                    fullWidth
                    error={formik.touched.city && !!formik.errors.city} helperText={formik.errors.city}
                  />
                </Grid>
                <Grid item xs>
                  <Field as={TextField}
                    name="state"
                    type="text"
                    label="State"
                    variant="outlined"
                    fullWidth
                    error={formik.touched.state && !!formik.errors.state} helperText={formik.errors.state}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Field as={TextField}
                    name="zipcode"
                    type="text"
                    label="Zip"
                    variant="outlined"
                    fullWidth
                    error={formik.touched.zipcode && !!formik.errors.zipcode} helperText={formik.errors.zipcode}
                  />
                </Grid>
              </Grid>
              {!formik.isValid && (
                <Typography variant="body2" className={classes.errorText}>
                  Please fix the errors above.
                </Typography>
              )}
              <div className={classes.buttons}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  Sign Up!
                </Button>
              </div>

              <Typography variant="subtitle2">
                Note: The volunteers are working on a privacy policy and will
                publish it in the coming week.
              </Typography>
            </Container>
          </form>
          )}
        </Formik>
      </Paper>
    </Container>
  );
}

export default NewUser;