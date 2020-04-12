import React, { useState } from 'react';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import * as Yup from 'yup';
import { makeStyles } from '@material-ui/core/styles';
import { useFirestore, useFirestoreDocData, useUser } from 'reactfire';
import { USERS_COLLECTION } from 'constants/collections';
import ClickableMap from 'routes/Request/components/RequestPage/ClickableMap';
import { useForm } from 'react-hook-form';
import { validateEmail } from 'utils/form';
import { ACCOUNT_PATH } from 'constants/paths';
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
  const userRef = firestore.doc(`${USERS_COLLECTION}/${user && user.uid}`);
  const userProfile = useFirestoreDocData(userRef);
  const [userLocation, setUserLocation] = useState(null);

  if (userProfile) {
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
              to={ACCOUNT_PATH}
              size="small"
              color="primary">
              View Profile
            </Button>
          </CardActions>
        </Card>
      </Container>
    );
  }

  const handleLocationChange = (location) => {
    setUserLocation(location);
  };

  const handleFormSubmit = async (values) => {
    if (!userLocation) {
      alert('Please select a location above.'); // eslint-disable-line no-alert
      return;
    }

    values.coordinates = userLocation; // eslint-disable-line
    await userRef.set(values, { merge: true });
  };

  return (
    <Container maxWidth="md">
      <Helmet>
        <title>Sign Up</title>
      </Helmet>
      <Paper className={classes.paper}>
        <Typography
          component="h1"
          variant="h4"
          align="center"
          className={classes.header}>
          Sign Up
        </Typography>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Container maxWidth="sm">
            <Typography variant="subtitle2" className={classes.intro}>
              Please complete the following information so we can find matches
              efficiently.
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs>
                <TextField
                  name="firstName"
                  type="text"
                  label="First Name"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  inputRef={register}
                  error={!!errors.firstName}
                  helperText={errors.firstName && 'firstName must be valid'}
                />
              </Grid>
              <Grid item xs>
                <TextField
                  name="lastName"
                  type="text"
                  label="Last Name"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  inputRef={register}
                  error={!!errors.lastName}
                  helperText={errors.lastName && 'lastName must be valid'}
                />
              </Grid>
            </Grid>
            <Grid container spacing={3}>
              <Grid item xs={8}>
                <TextField
                  type="email"
                  name="email"
                  placeholder="email"
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
            <Typography variant="body2" className={classes.intro}>
              A rough location is needed to allow us to efficiently and quickly
              find a match. You can either click on the &quot;Detect
              Location&quot; button below the map or click on the map to specify
              the location.
            </Typography>
            <Card>
              <ClickableMap onLocationChange={handleLocationChange} />
            </Card>
            <Divider className={classes.optionalDivider} />
            <Typography variant="h6" gutterBottom>
              Optional &ndash; Address
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs>
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
            </Grid>
            <Grid container spacing={3}>
              <Grid item xs>
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
            <Grid container spacing={3}>
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

            <Typography variant="subtitle2" className={classes.warrantyInfo}>
              {/* eslint-disable no-irregular-whitespace */}
              Note: This website and all related work products are provided
              ​&quot;AS IS&quot;. The provider of this service makes no other
              warranties, express or implied, and hereby disclaims all implied
              warranties, including any warranty of merchantability and warranty
              of fitness for a particular purpose.
              {/* eslint-enable no-irregular-whitespace */}
              <br />
              <br />
              The volunteers are working on a privacy policy and will publish it
              soon.
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
