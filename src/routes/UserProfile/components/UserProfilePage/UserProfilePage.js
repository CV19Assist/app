import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Typography,
  TextField,
  Paper,
  Card,
  Button,
  Container,
  Grid,
  makeStyles,
} from '@material-ui/core';
import { useHistory } from 'react-router-dom';
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
  USERS_PUBLIC_COLLECTION,
} from 'constants/collections';
import ClickableMap from 'components/ClickableMap';
import LoadingSpinner from 'components/LoadingSpinner';
import { useForm, FormContext, useFormContext } from 'react-hook-form';
import { SEARCH_PATH } from 'constants/paths';
import styles from './UserProfilePage.styles';

const useStyles = makeStyles(styles);

function isGoogleLoggedIn(user) {
  return !!user && user.providerData[0].providerId === 'google.com';
}

function hasProfile(userData) {
  return !!userData && !!userData.email;
}

function isLoggedIn(user) {
  return !!user && !!user.uid;
}

function UserProfile() {
  const classes = useStyles();
  const firestore = useFirestore();
  const user = useUser();
  const auth = useAuth();
  const history = useHistory();
  const { showError, showMessage } = useNotifications();
  const [isLoading, setLoadingState] = useState(true);
  const [userLocationInfo, setUserLocationInfo] = useState(null);
  const [retries, setRetries] = useState(0);
  const [userRef, setUserRef] = useState(null);
  const [userData, setUserData] = useState(null);
  const [activeStep, setActiveStep] = useState(isGoogleLoggedIn(user) ? 2 : 0);

  const userProfileSchema = useMemo(
    () =>
      Yup.object().shape({
        firstName: Yup.string().min(2, 'Too Short').required('Required'),
        lastName: Yup.string().min(2, 'Too Short').required('Required'),
        email: Yup.string(),
        phone: Yup.string().required('Required'),
        password: Yup.string(),
        confirmPassword: Yup.string().oneOf(
          [Yup.ref('password'), null],
          'Passwords must match',
        ),
        address1: Yup.string(),
        address2: Yup.string(),
        city: Yup.string(),
        state: Yup.string(),
        zipcode: Yup.string(),
      }),
    [],
  );

  const steps = ['Email', 'Password', 'Contact Info', 'Location'];

  const userFieldsStepMap = {
    email: 0,
    password: 1,
    confirmPassword: 1,
    firstName: 2,
    lastName: 2,
    phone: 2,
    address1: 3,
    address2: 3,
    city: 3,
    state: 3,
    zipcode: 3,
  };

  const formContext = useFormContext();

  const useYupValidationResolver = (validationSchema) =>
    useCallback(
      async (data) => {
        try {
          const values = await validationSchema.validate(data, {
            abortEarly: false,
          });

          return {
            values,
            errors: {},
          };
        } catch (errors) {
          const errs = errors.inner.reduce(
            (allErrors, currentError) => ({
              ...allErrors,
              [currentError.path]: {
                type: currentError.type ?? 'validation',
                message: currentError.message,
              },
            }),
            {},
          );
          console.log('Errors: ', errs, 'Form State: ', formContext); // eslint-disable-line no-console
          let step = 3;
          Object.keys(errs).forEach((field) => {
            const errStep = userFieldsStepMap[field];
            step = errStep < step ? errStep : step;
          });
          setActiveStep(step);
          return {
            values: {},
            errors: errs,
          };
        }
      },
      [validationSchema],
    );

  const validationResolver = useYupValidationResolver(userProfileSchema);

  // const {
  //   handleSubmit,
  //   errors,
  //   register,
  //   formState: { isValid, dirty },
  //   getValues,
  //   setValue,
  // } = useForm({
  const methods = useForm({
    validationResolver,
  });

  // Because of timing issues, this component will likely get run before the server has applied
  // the requested document access resulting in almost a guranteed permission-denied error. So,
  // we use this effect to monitor for permission-denied until the change has propagated, at which
  // point, we do the actual doc subscription (next useEffect);
  useEffect(() => {
    console.log(userData, user); // eslint-disable-line no-console
    async function getData() {
      if (isLoggedIn(user) && userData == null) {
        // Already authenticated and haven't loaded data previously
        setLoadingState(true);
        const ref = firestore.doc(`${USERS_PRIVILEGED_COLLECTION}/${user.uid}`);
        let data = {};
        try {
          console.log('ref', ref); // eslint-disable-line no-console
          // Call it once because this will throw the permission exception.
          const snap = await ref.get();
          data = snap.data();
          setUserData(data);
          setUserRef(ref);
          console.log('Got data', data, ref); // eslint-disable-line no-console
          if (!!data && Object.keys(data).length) {
            Object.keys(userFieldsStepMap).forEach(function getDefaults(key) {
              methods.setValue(key, data[key]);
            });
            console.log('Loaded data into defaults'); // eslint-disable-line no-console
          }
        } catch (err) {
          // We only try reloading if insufficient permissions.
          if (err.code !== 'permission-denied') {
            console.log('permission denied'); // eslint-disable-line no-console
            throw err;
          }
          window.setTimeout(() => {
            setRetries(retries + 1);
          }, 1000);
        }
      }
      setLoadingState(false);
    }
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retries]);

  const handleNext = () => {
    console.log('Data from this form (Next)', { ...methods.getValues() }); // eslint-disable-line no-console
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    console.log('Data from this form (Back)', { ...methods.getValues() }); // eslint-disable-line no-console
    setActiveStep(activeStep - 1);
  };

  /**
   * Sets the value for the given field if it isn't already populated.
   * @param {string} fieldName name of the field which will be set
   * @param {string} allFieldValues current value of all fields
   * @param {object} googleResultComponent address component returned by the Google Maps API
   * @param {object} addressType type of address component to lookup
   * @param {string} addressTypeFormat short_name or long_name
   */
  function setAddress(
    fieldName,
    googleResultComponent,
    addressType,
    addressTypeFormat = 'long_name',
  ) {
    if (googleResultComponent.types.includes(addressType)) {
      methods.setValue(fieldName, googleResultComponent[addressTypeFormat]);
    }
  }

  function handleSetUserLocationInfo(locationInfo) {
    setUserLocationInfo(locationInfo);
    const result = locationInfo.lookedUpAddress;
    if (result) {
      let streetNumber = '';
      let streetAddress = '';
      result.address_components.forEach((component) => {
        setAddress('city', component, 'locality');
        setAddress(
          'state',

          component,
          'administrative_area_level_1',
          'short_name',
        );
        setAddress('zipcode', component, 'postal_code');
        if (component.types.includes('street_number')) {
          streetNumber = component.short_name;
        }
        if (component.types.includes('route')) {
          streetAddress = component.short_name;
        }
      });
      if (streetNumber && streetAddress) {
        methods.setValue('address1', `${streetNumber} ${streetAddress}`);
      }
    }
  }

  // const handleLocationChange = (location) => {
  //   setUserLocation(location);
  // };

  async function handleFormSubmit(values) {
    const newValues = values;
    let uid = null;
    let newUser = false;
    console.log('In submit', values, userData, userRef); // eslint-disable-line no-console

    // New user created with email/password
    if (!isLoggedIn(user)) {
      try {
        // Try creating new user
        const authState = await auth.createUserWithEmailAndPassword(
          methods.getValues('email'),
          methods.getValues('password'),
        );
        newUser = true;
        uid = authState.user.uid;
      } catch (err) {
        showError(err.message);
        if (err.code === 'auth/weak-password') {
          setActiveStep(1);
        } else {
          setActiveStep(0);
        }
        return;
      }
    } else {
      uid = user.uid;
    }
    try {
      // Get email if we came in through Google. Wouldn't be in the form
      if (isGoogleLoggedIn(user)) {
        console.log(user, user.email); // eslint-disable-line no-console
        newValues.email = user.email;
      } else if (isLoggedIn(user)) {
        // Check for email/password changes
        if (newValues.email !== user.email) {
          await user.updateEmail(newValues.email);
        }
        if (newValues.password) {
          await user.updatePassword(newValues.password);
        }
      }
      // Write USERS profile
      const userSnap = await firestore.doc(`${USERS_COLLECTION}/${uid}`).get();
      newValues.displayName = `${values.firstName} ${values.lastName}`;
      let newProfile = {
        firstName: newValues.firstName,
        lastName: newValues.lastName,
        email: newValues.email,
        displayName: newValues.displayName,
      };
      await userSnap.ref.set(newProfile, { merge: true });
      // Write USERS_PRIVILEGED profile
      newProfile = { ...newValues };
      const userPrivSnap = await firestore
        .doc(`${USERS_PRIVILEGED_COLLECTION}/${uid}`)
        .get();
      console.log('Updating with', newProfile); // eslint-disable-line no-console
      await userPrivSnap.ref.set(newProfile, { merge: true });
      // Write USERS_PUBLIC profile
      newProfile = { d: { hasProfile: true } };
      const userPubSnap = await firestore
        .doc(`${USERS_PUBLIC_COLLECTION}/${uid}`)
        .get();
      console.log('Updating with', newProfile); // eslint-disable-line no-console
      await userPubSnap.ref.set(newProfile, { merge: true });
      console.log('Updated'); // eslint-disable-line no-console
      showMessage(newUser ? 'Account created' : 'Profile updated');
      history.replace(SEARCH_PATH);
    } catch (err) {
      showError(err.message);
      setActiveStep(0);
      // TODO: If a new user, remove their Firebase account if profile didn't save?
    }
  }

  function renderFields(step) {
    return (
      <div className={classes.centerDiv}>
        <Grid
          style={{ display: step === 0 ? 'flex' : 'none' }}
          container
          justify="center"
          spacing={1}>
          <Grid item xs={6}>
            <TextField
              name="email"
              type="text"
              label="Email"
              variant="outlined"
              margin="normal"
              fullWidth
              inputRef={methods.register}
              error={!!methods.errors.email}
              helperText={methods.errors.email && 'Enter a valid email address'}
            />
          </Grid>
        </Grid>
        <Grid
          style={{ display: step === 1 ? 'flex' : 'none' }}
          container
          justify="center"
          spacing={1}>
          <Grid item xs={6}>
            <TextField
              name="password"
              type="password"
              label="Password"
              variant="outlined"
              margin="normal"
              fullWidth
              inputRef={methods.register}
              error={!!methods.errors.password}
              helperText={methods.errors.password && 'Password must be...'}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="confirmPassword"
              type="password"
              label="Confirm Password"
              variant="outlined"
              margin="normal"
              fullWidth
              inputRef={methods.register}
              error={!!methods.errors.confirmPassword}
              helperText={
                methods.errors.confirmPassword && 'Passwords must match'
              }
            />
          </Grid>
        </Grid>
        <Grid
          style={{ display: step === 2 ? 'flex' : 'none' }}
          container
          justify="center"
          spacing={1}>
          <Grid item xs={6}>
            <TextField
              name="firstName"
              type="text"
              label="First Name"
              variant="outlined"
              margin="normal"
              fullWidth
              inputRef={methods.register}
              error={!!methods.errors.firstName}
              helperText={
                methods.errors.firstName && 'Enter a valid First Name'
              }
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
              inputRef={methods.register}
              error={!!methods.errors.lastName}
              helperText={methods.errors.lastName && 'Enter a valid Last Name'}
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
              inputRef={methods.register}
              error={!!methods.errors.phone}
              helperText={methods.errors.phone && 'Enter a valid phone number'}
            />
          </Grid>
        </Grid>
        <Grid
          style={{ display: step === 3 ? 'flex' : 'none' }}
          container
          justify="center"
          spacing={1}>
          <Typography variant="h6" gutterBottom>
            Your Location
          </Typography>
          <Typography gutterBottom>
            A rough location is needed to allow us to efficiently and quickly
            find a match. Enter address in the address search, click the
            &quot;Detect Location&quot; button, or click on the map. You can
            also enter your full address in the fields at the bottom.{' '}
          </Typography>
          <Card>
            <ClickableMap
              onLocationChange={handleSetUserLocationInfo}
              locationInfo={userLocationInfo}
            />
          </Card>
          <Grid container>
            <Grid item sm={12}>
              <TextField
                name="address1"
                label="Street 1"
                variant="outlined"
                margin="normal"
                fullWidth
                inputRef={methods.register}
                InputLabelProps={{ shrink: true }}
                error={!!methods.errors.address1}
                helperText={methods.errors.address1 && 'address1 must be valid'}
              />
            </Grid>
            <Grid item sm={12}>
              <TextField
                name="address2"
                label="Street 2"
                variant="outlined"
                margin="normal"
                fullWidth
                inputRef={methods.register}
                InputLabelProps={{ shrink: true }}
                error={!!methods.errors.address2}
                helperText={
                  methods.errors.address2 && 'Address 2 must be valid'
                }
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
                inputRef={methods.register}
                InputLabelProps={{ shrink: true }}
                error={!!methods.errors.city}
                helperText={methods.errors.city && 'City must be valid'}
              />
            </Grid>
            <Grid item xs>
              <TextField
                name="state"
                label="State"
                variant="outlined"
                margin="normal"
                fullWidth
                inputRef={methods.register}
                InputLabelProps={{ shrink: true }}
                error={!!methods.errors.state}
                helperText={methods.errors.state && 'State must be valid'}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                name="zipcode"
                label="Zip"
                variant="outlined"
                margin="normal"
                fullWidth
                inputRef={methods.register}
                InputLabelProps={{ shrink: true }}
                error={!!methods.errors.zipcode}
                helperText={methods.errors.zipcode && 'Zip code must be valid'}
              />
            </Grid>
          </Grid>
        </Grid>
      </div>
    );
  }

  return (
    <Container maxWidth="md">
      <div style={{ display: isLoading ? 'block' : 'none' }}>
        <LoadingSpinner />
      </div>
      <div style={{ display: isLoading ? 'none' : 'block' }}>
        <Helmet>
          <title>
            {hasProfile(userData) ? 'My Profile' : ' I Want To Help'}
          </title>
        </Helmet>
        <Typography variant="h4" gutterBottom>
          {hasProfile(userData) ? 'My Profile' : ' I Want To Help'}
        </Typography>
        <Paper className={classes.paper}>
          <FormContext {...methods}>
            <form
              className={classes.root}
              onSubmit={methods.handleSubmit(handleFormSubmit)}>
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
                <div className={classes.centerDiv}>
                  <Button
                    disabled={
                      activeStep === 0 ||
                      (activeStep === 2 && isGoogleLoggedIn(user))
                    }
                    onClick={handleBack}>
                    Back
                  </Button>
                  <Button
                    style={{
                      display:
                        activeStep === steps.length - 1
                          ? 'inline-flex'
                          : 'none',
                    }}
                    variant="contained"
                    color="primary"
                    type="submit">
                    Finish
                  </Button>
                  <Button
                    style={{
                      display:
                        activeStep !== steps.length - 1
                          ? 'inline-flex'
                          : 'none',
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
                  warranties, express or implied, and hereby disclaims all
                  implied warranties, including any warranty of merchantability
                  and warranty of fitness for a particular purpose.
                </Typography>
              </Container>
            </form>
          </FormContext>
        </Paper>
      </div>
    </Container>
  );
}

export default UserProfile;
