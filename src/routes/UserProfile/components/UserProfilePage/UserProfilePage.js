import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  TextField,
  Paper,
  Button,
  Container,
  Grid,
  makeStyles,
} from '@material-ui/core';
import { Link, useHistory } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import * as Yup from 'yup';
import { useAuth, useFirestore, useUser } from 'reactfire';
import useNotifications from 'modules/notification/useNotifications';
import {
  USERS_COLLECTION,
  USERS_PRIVILEGED_COLLECTION,
} from 'constants/collections';
import ClickableMap from 'components/ClickableMap';
import GoogleSignIn from 'components/GoogleSignIn';
import { useForm } from 'react-hook-form';
import { SEARCH_PATH } from 'constants/paths';
import styles from './UserProfilePage.styles';

const useStyles = makeStyles(styles);

const userProfileSchema = Yup.object().shape({
  firstName: Yup.string().min(2, 'Too Short').required('Required'),
  lastName: Yup.string().min(2, 'Too Short').required('Required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Required'),
  phone: Yup.string().required('Required'),
  password: Yup.string().required('Password is required'),
  confirmPassword: Yup.string().oneOf(
    [Yup.ref('password'), null],
    'Passwords must match',
  ),
  address1: Yup.string(),
  address2: Yup.string(),
  city: Yup.string(),
  state: Yup.string(),
  zipcode: Yup.string(),
});
const userFields = Object.keys(userProfileSchema.describe().fields);

function getSteps() {
  return ['Email', 'Password', 'Contact Info', 'Location'];
}

function hasAccount(userData) {
  return !!userData && !!userData.email;
}

function isLoggedIn(user) {
  return !!user && !!user.uid;
}

function isGoogleLoggedIn(user) {
  return !!user && user.providerId === 'google';
}

function UserProfile() {
  const classes = useStyles();
  const firestore = useFirestore();
  const user = useUser();
  const auth = useAuth();
  const { showError } = useNotifications();
  // const defaultValues = {};

  const [retries, setRetries] = useState(0);
  const [userRef, setUserRef] = useState(null);
  const [userData, setUserData] = useState(null);
  // const [formValues, setFormValues] = useState(null);

  const [activeStep, setActiveStep] = useState(0);
  const steps = getSteps();
  const {
    handleSubmit,
    errors,
    register,
    formState: { isValid, dirty },
    getValues,
    setValue,
  } = useForm({
    validationSchema: userProfileSchema,
  });

  // Because of timing issues, this component will likely get run before the server has applied
  // the requested document access resulting in almost a guranteed permission-denied error. So,
  // we use this effect to monitor for permission-denied until the change has propagated, at which
  // point, we do the actual doc subscription (next useEffect);
  useEffect(() => {
    console.log(userData, user);
    async function getData() {
      if (isLoggedIn(user) && userData == null) {
        // Already authenticated and haven't loaded data previously
        console.log('User', user.uid);
        const ref = firestore.doc(`${USERS_PRIVILEGED_COLLECTION}/${user.uid}`);
        let data = {};
        try {
          console.log('ref', ref);
          // Call it once because this will throw the permission exception.
          const snap = await ref.get();
          data = snap.data();
          setUserData(data);
          setUserRef(ref);
          console.log('Got data', data, ref);
          if (!!data && Object.keys(data).length) {
            userFields.forEach(function getDefaults(key) {
              setValue(key, data[key]);
            });
            console.log('Loaded data into defaults');
          }
        } catch (err) {
          // We only try reloading if insufficient permissions.
          if (err.code !== 'permission-denied') {
            console.log('permission denied');
            throw err;
          }
          window.setTimeout(() => {
            setRetries(retries + 1);
          }, 1000);
        }
      }
    }
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retries]);

  // Do step-dependent

  const handleNext = () => {
    console.log('Data from this form (Next)', { ...getValues() });
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    console.log('Data from this form (Back)', { ...getValues() });
    setActiveStep(activeStep - 1);
  };

  const [userLocationInfo, setUserLocationInfo] = useState(null);

  /**
   * Sets the value for the given field if it isn't already populated.
   * @param {string} fieldName name of the field which will be set
   * @param {string} allFieldValues current value of all fields
   * @param {object} googleResultComponent address component returned by the Google Maps API
   * @param {object} addressType type of address component to lookup
   * @param {string} addressTypeFormat short_name or long_name
   */
  function setValueIfNotAlreadySet(
    fieldName,
    allFieldValues,
    googleResultComponent,
    addressType,
    addressTypeFormat = 'long_name',
  ) {
    if (
      googleResultComponent.types.includes(addressType) &&
      !allFieldValues[fieldName]
    ) {
      setValue(fieldName, googleResultComponent[addressTypeFormat]);
    }
  }

  const handleGoogleSignIn = useCallback((authState) => {
    console.log(authState);
  }, []);

  function handleSetUserLocationInfo(locationInfo) {
    setUserLocationInfo(locationInfo);
    const result = locationInfo.lookedUpAddress;
    if (result) {
      const values = getValues();
      let streetNumber = '';
      let streetAddress = '';
      result.address_components.forEach((component) => {
        setValueIfNotAlreadySet('city', values, component, 'locality');
        setValueIfNotAlreadySet(
          'state',
          values,
          component,
          'administrative_area_level_1',
          'short_name',
        );
        setValueIfNotAlreadySet('zipcode', values, component, 'postal_code');
        if (component.types.includes('street_number')) {
          streetNumber = component.short_name;
        }
        if (component.types.includes('route')) {
          streetAddress = component.short_name;
        }
      });
      if (streetNumber && streetAddress && !values.address1) {
        setValue('address1', `${streetNumber} ${streetAddress}`);
      }
    }
  }

  // const handleLocationChange = (location) => {
  //   setUserLocation(location);
  // };

  async function handleFormSubmit(values) {
    const newValues = values;
    console.log('In submit', values, userData, userRef);

    // New user created with email/password
    if (!isLoggedIn(user)) {
      try {
        // Try creating new user
        const authState = await auth.createUserWithEmailAndPassword(
          getValues('email'),
          getValues('password'),
        );
        // Write USERS profile
        const userSnap = await firestore
          .doc(`${USERS_COLLECTION}/${authState.user.uid}`)
          .get();
        newValues.displayName = `${values.firstName} ${values.lastName}`;
        let newProfile = {
          firstName: newValues.firstName,
          lastName: newValues.lastName,
          email: newValues.email,
          displayName: newValues.displayName,
        };
        await userSnap.ref.set(newProfile, { merge: true });
        // Write the USERS_PRIVILEGED profile
        newProfile = { ...newValues };
        const userPrivSnap = await firestore
          .doc(`${USERS_PRIVILEGED_COLLECTION}/${authState.user.uid}`)
          .get();
        console.log('Updating with', newProfile);
        await userPrivSnap.ref.set(newProfile, { merge: true });
        console.log('Updated');
      } catch (err) {
        showError(err.message);
        setActiveStep(0);
      }
    }
  }

  function renderFields(step) {
    return (
      <div>
        <Grid
          style={{ display: step === 0 ? 'block' : 'none' }}
          container
          spacing={1}
          direction="column">
          <Grid item xs={6}>
            <TextField
              name="email"
              type="text"
              label="Email"
              variant="outlined"
              margin="normal"
              fullWidth
              inputRef={register}
              error={!!errors.email}
              helperText={errors.email && 'Enter a valid email address'}
            />
          </Grid>
          {!hasAccount(userData) ? (
            <GoogleSignIn
              label="Sign up with Google"
              handleClick={(authState) => {
                handleGoogleSignIn(authState);
              }}
            />
          ) : null}
        </Grid>
        <Grid
          style={{ display: step === 1 ? 'block' : 'none' }}
          container
          spacing={1}
          direction="row">
          <Grid item xs={6}>
            <TextField
              name="password"
              type="text"
              label="Password"
              variant="outlined"
              margin="normal"
              fullWidth
              inputRef={register}
              error={!!errors.password}
              helperText={errors.password && 'Password must be...'}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="confirmPassword"
              type="text"
              label="Confirm Password"
              variant="outlined"
              margin="normal"
              fullWidth
              inputRef={register}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword && 'Passwords must match'}
            />
          </Grid>
        </Grid>
        <Grid
          style={{ display: step === 2 ? 'block' : 'none' }}
          container
          spacing={1}
          direction="row">
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
              helperText={errors.firstName && 'Enter a valid First Name'}
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
              helperText={errors.lastName && 'Enter a valid Last Name'}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="phone"
              type="text"
              label="Phone"
              variant="outlined"
              margin="normal"
              fullWidth
              inputRef={register}
              error={!!errors.phone}
              helperText={errors.phone && 'Enter a valid phone number'}
            />
          </Grid>
        </Grid>
        <Grid
          style={{ display: step === 3 ? 'block' : 'none' }}
          container
          spacing={1}
          direction="row">
          <Grid item xs={6}>
            <TextField
              name="address1"
              type="text"
              label="Address"
              variant="outlined"
              margin="normal"
              fullWidth
              inputRef={register}
              error={!!errors.address1}
              helperText={errors.address1 && 'Enter a valid street address'}
            />
          </Grid>
        </Grid>
      </div>
    );
  }

  return (
    <Container maxWidth="md">
      <Helmet>
        <title>{hasAccount(userData) ? 'My Profile' : ' I Want To Help'}</title>
      </Helmet>
      <Typography variant="h4" gutterBottom>
        {hasAccount(userData) ? 'My Profile' : ' I Want To Help'}
      </Typography>
      <Paper className={classes.paper}>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Container>
            <Stepper activeStep={activeStep}>
              {steps.map((label) => {
                const stepProps = {};
                const labelProps = {};
                return (
                  <Step key={label} {...stepProps}>
                    <StepLabel {...labelProps}>{label}</StepLabel>
                  </Step>
                );
              })}
            </Stepper>
          </Container>
          <Container>
            {renderFields(activeStep)}
            <div>
              <Button disabled={activeStep === 0} onClick={handleBack}>
                Back
              </Button>
              <Button
                style={{
                  display:
                    activeStep === steps.length - 1 ? 'inline-flex' : 'none',
                }}
                variant="contained"
                color="primary"
                type="submit">
                Finish
              </Button>
              <Button
                style={{
                  display:
                    activeStep !== steps.length - 1 ? 'inline-flex' : 'none',
                }}
                variant="contained"
                color="primary"
                onClick={handleNext}>
                Next
              </Button>
            </div>

            <Typography className={classes.warrantyInfo}>
              Note: This website and all related work products are provided
              &quot;AS IS&quot;. The provider of this service makes no other
              warranties, express or implied, and hereby disclaims all implied
              warranties, including any warranty of merchantability and warranty
              of fitness for a particular purpose.
            </Typography>
            {dirty && errors && !!Object.keys(errors).length && !isValid && (
              <Typography variant="body2" className={classes.errorText}>
                Please fix the errors above.
              </Typography>
            )}
          </Container>
        </form>
      </Paper>
    </Container>
  );
}

export default UserProfile;
