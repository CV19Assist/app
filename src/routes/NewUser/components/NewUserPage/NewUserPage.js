import React, { useState } from 'react';
import {
  Typography,
  TextField,
  Paper,
  Divider,
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Grid,
  makeStyles,
} from '@material-ui/core';
import {
  ExitToApp as LogoutIcon,
  Person as AccountIcon,
} from '@material-ui/icons';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import * as Yup from 'yup';
import { useFirestore, useFirestoreDocData, useUser } from 'reactfire';
import { USERS_COLLECTION } from 'constants/collections';
import ClickableMap from 'components/ClickableMap';
import { useForm } from 'react-hook-form';
import { validateEmail } from 'utils/form';
import { ACCOUNT_PATH, LOGOUT_PATH } from 'constants/paths';
import styles from './NewUserPage.styles';

const useStyles = makeStyles(styles);

const userProfileSchema = Yup.object().shape({
  firstName: Yup.string().min(2, 'Too Short').required('Required'),
  lastName: Yup.string().min(2, 'Too Short').required('Required'),
  email: Yup.string()
    .email('Please enter a valida email address')
    .required('Required'),
  phone: Yup.string().required('Required'),
  address1: Yup.string(),
  address2: Yup.string(),
  city: Yup.string(),
  state: Yup.string(),
  zipcode: Yup.string(),
});

function NewUser() {
  const classes = useStyles();
  const firestore = useFirestore();
  const user = useUser();
  const {
    handleSubmit,
    errors,
    register,
    formState: { isValid },
  } = useForm({
    validationSchema: userProfileSchema,
  });
  const userRef = firestore.doc(`${USERS_COLLECTION}/${user.uid}`);
  const userProfile = useFirestoreDocData(userRef);
  const [userLocationInfo, setUserLocationInfo] = useState(null);

  if (userProfile) {
    return (
      <Container maxWidth="md">
        <Card style={{ minWidth: 275 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              New User Setup
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              You are already signed up so you do not have to sign up again.
            </Typography>
          </CardContent>
          <CardActions>
            <Button
              component={Link}
              to={ACCOUNT_PATH}
              startIcon={<AccountIcon />}
              size="small"
              color="primary">
              View Your Profile
            </Button>
            <Button
              component={Link}
              to={LOGOUT_PATH}
              startIcon={<LogoutIcon />}
              size="small"
              color="secondary">
              Logout
            </Button>
          </CardActions>
        </Card>
      </Container>
    );
  }

  // const handleLocationChange = (location) => {
  //   setUserLocation(location);
  // };

  const handleFormSubmit = async (values) => {
    if (!userLocationInfo) {
      alert('Please select a location above.'); // eslint-disable-line no-alert
      return;
    }

    values.coordinates = userLocation; // eslint-disable-line
    await userRef.set(values, { merge: true });
  };

  return (
    <Container maxWidth="md">
      <Helmet>
        <title>Volunteer Sign Up</title>
      </Helmet>
      <Typography variant="h4" gutterBottom>
        Volunteer Sign Up
      </Typography>
      <Paper className={classes.paper}>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Container>
            <Typography gutterBottom>
              Thank you for volunteering with CV19 Assist. Please complete the
              following information so we can efficiently find matches.
            </Typography>
            <Grid container spacing={1} direction="row">
              <Grid item xs={6}>
                <TextField
                  name="firstName"
                  type="text"
                  label="First Name"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  inputRef={register}
                  error={!!errors.firstName}
                  helperText={errors.firstName && 'First name must be valid'}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="lastName"
                  type="text"
                  label="Last Name"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  inputRef={register}
                  error={!!errors.lastName}
                  helperText={errors.lastName && 'Last name must be valid'}
                />
              </Grid>
              <Grid item xs={8}>
                <TextField
                  type="email"
                  name="email"
                  label="Email"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  inputRef={register({
                    required: true,
                    validate: validateEmail,
                  })}
                  error={!!errors.email}
                  helperText={errors.email && 'Email must be valid'}
                />
              </Grid>
              <Grid item xs>
                <TextField
                  name="phone"
                  type="tel"
                  label="Phone"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  inputRef={register}
                  error={!!errors.phone}
                  helperText={errors.phone && 'phone must be valid'}
                />
              </Grid>
            </Grid>
            <Divider className={classes.optionalDivider} />
            <Typography variant="h6" gutterBottom>
              Please click or tap on your location
            </Typography>
            <Typography gutterBottom>
              A rough location is needed to allow us to efficiently and quickly
              find a match. You can either click on the &quot;Detect
              Location&quot; button below the map or click on the map to specify
              the location.
            </Typography>
            <Card>
              <ClickableMap
                onLocationChange={setUserLocationInfo}
                locationInfo={userLocationInfo}
              />
            </Card>
            <Divider className={classes.optionalDivider} />
            <Typography variant="h6" gutterBottom>
              Optional &ndash; Address
            </Typography>
            <Grid container>
              <Grid item sm={12}>
                <TextField
                  name="address1"
                  label="Street 1"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  inputRef={register}
                  error={!!errors.address1}
                  helperText={errors.address1 && 'address1 must be valid'}
                />
              </Grid>
              <Grid item sm={12}>
                <TextField
                  name="address2"
                  label="Street 2"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  inputRef={register}
                  error={!!errors.address2}
                  helperText={errors.address2 && 'Address 2 must be valid'}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  name="city"
                  label="City"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  inputRef={register}
                  error={!!errors.city}
                  helperText={errors.city && 'City must be valid'}
                />
              </Grid>
              <Grid item xs>
                <TextField
                  name="state"
                  label="State"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  inputRef={register}
                  error={!!errors.state}
                  helperText={errors.state && 'State must be valid'}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  name="zipcode"
                  label="Zip"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  inputRef={register}
                  error={!!errors.zipcode}
                  helperText={errors.zipcode && 'State must be valid'}
                />
              </Grid>
            </Grid>

            <Typography className={classes.warrantyInfo}>
              Note: This website and all related work products are provided
              &quot;AS IS&quot;. The provider of this service makes no other
              warranties, express or implied, and hereby disclaims all implied
              warranties, including any warranty of merchantability and warranty
              of fitness for a particular purpose.
            </Typography>
            {!isValid && (
              <Typography variant="body2" className={classes.errorText}>
                Please fix the errors above.
              </Typography>
            )}
            <div className={classes.buttons}>
              <Button type="submit" variant="contained" color="primary">
                Sign Up!
              </Button>
            </div>
          </Container>
        </form>
      </Paper>
    </Container>
  );
}

export default NewUser;
