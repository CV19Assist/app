import React from 'react';
import { Helmet } from 'react-helmet';
import * as Yup from 'yup';
import { useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import queryString from 'query-string';
import {
  FormHelperText,
  FormControlLabel,
  Button,
  Zoom,
  Card,
  FormGroup,
  Typography,
  Divider,
  Paper,
  Grid,
  TextField,
  Checkbox,
  Radio,
  Container,
  RadioGroup,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { activeCategoryMap } from 'constants/categories';
import ClickableMap from 'components/ClickableMap';
import LoadingSpinner from 'components/LoadingSpinner';
import useNewRequestPage from './useNewRequestPage';
import styles from './NewRequestPage.styles';

const useStyles = makeStyles(styles);

const requestValidationSchema = Yup.object().shape({
  firstName: Yup.string().required('Required').min(2, 'Too Short'),
  lastName: Yup.string().required('Required').min(2, 'Too Short'),
  immediacy: Yup.string().required('Please select the immediacy.'),
  needs: Yup.object().test(
    'one-need-required',
    'Please select at least one need.',
    (value) => {
      let checkedOne = false;
      Object.keys(value).forEach((item) => {
        if (value[item] === true) {
          checkedOne = true;
        }
      });
      return checkedOne;
    },
  ),
  phone: Yup.string().required('Required').min(2, 'Too Short'),
  email: Yup.string().email().min(2, 'Too Short'),
  otherComments: Yup.string(),
  needFinancialAssistance: Yup.string(),
});

function NewRequestPage() {
  const classes = useStyles();
  const location = useLocation();
  const qs = queryString.parse(location.search);
  const defaultValues = {
    needs: {},
    immediacy: '1',
    needFinancialAssistance: 'false',
  };

  // Append needs from query string type
  if (qs && qs.type) {
    defaultValues.needs = { [qs.type]: true };
  }

  const {
    register,
    handleSubmit,
    errors,
    watch,
    control,
    formState: { isValid, isSubmitting, dirty },
  } = useForm({
    validationSchema: requestValidationSchema,
    defaultValues,
  });

  const {
    submitRequest,
    handleLocationChange,
    requestLocation,
    requestLocationLoading,
  } = useNewRequestPage();
  const currentNeeds = watch('needs');
  const groceryPickup = currentNeeds && currentNeeds['grocery-pickup'];

  return (
    <Container maxWidth="md">
      <Helmet>
        <title>Request Assistance</title>
      </Helmet>
      <Typography variant="h5" color="textPrimary" gutterBottom>
        Request Help
      </Typography>
      <Paper className={classes.paper} data-test="request-form">
        <div className={classes.heroContent}>
          <Container maxWidth="md">
            <form onSubmit={handleSubmit(submitRequest)}>
              <Container>
                <FormGroup>
                  <Typography
                    variant="h5"
                    gutterBottom
                    className={classes.otherComments}>
                    What do you need help with?
                  </Typography>
                  {Object.keys(activeCategoryMap).map((optionKey) => (
                    <FormControlLabel
                      key={optionKey}
                      control={
                        <Checkbox
                          inputRef={register}
                          name={`needs.${optionKey}`}
                          data-test={`need-${optionKey}`}
                          defaultChecked={defaultValues.needs[optionKey]}
                        />
                      }
                      label={
                        activeCategoryMap[optionKey].inputCaption
                          ? activeCategoryMap[optionKey].inputCaption
                          : activeCategoryMap[optionKey].description
                      }
                    />
                  ))}
                </FormGroup>
                {!!errors.needs && (
                  <FormHelperText error>{errors.needs.message}</FormHelperText>
                )}

                <Typography
                  variant="h5"
                  className={classes.otherComments}
                  gutterBottom={!groceryPickup}>
                  Details
                </Typography>
                <Zoom in={groceryPickup} unmountOnExit>
                  <Typography variant="subtitle1" gutterBottom>
                    For grocery pickup, please provide the list of groceries
                    that you would like the volunteer to get. Please be as
                    specific as possible.
                  </Typography>
                </Zoom>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      name="otherDetails"
                      data-test="otherDetails"
                      multiline
                      placeholder="Please be as specific as possible."
                      fullWidth
                      rows="4"
                      variant="outlined"
                      inputRef={register}
                    />
                  </Grid>
                </Grid>

                {/* <Zoom in={hasFinancialComponent} unmountOnExit> */}
                <div>
                  <Divider className={classes.optionalDivider} />
                  <Typography variant="h5" gutterBottom>
                    Will you be able to pay for your items?
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    This service is free, but the items still cost money. Are
                    you able to pay for your items? If not, we will do our best
                    to match you with organizations and volunteers who can also
                    provide financial assistance.
                  </Typography>
                  <Controller
                    as={
                      <RadioGroup
                        aria-label="Need Financial Assistance"
                        component="fieldset">
                        <FormControlLabel
                          value="false"
                          control={<Radio />}
                          label="Yes, I can pay and only need help with the delivery."
                        />
                        <FormControlLabel
                          value="true"
                          control={<Radio />}
                          label="No, I need help paying for the items."
                        />
                      </RadioGroup>
                    }
                    control={control}
                    onChange={([event]) => event.target.value}
                    name="needFinancialAssistance"
                  />
                  {!!errors.needFinancialAssistance && (
                    <FormHelperText error>
                      {errors.needFinancialAssistance}
                    </FormHelperText>
                  )}
                </div>
                {/* </Zoom> */}

                <Divider className={classes.optionalDivider} />
                <Typography variant="h5" gutterBottom>
                  Immediacy of Need
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Please let us know how urgently you need us to fulfill the
                  request. We will do our best to connect you with a volunteer
                  as soon as possible, however, we cannot guarantee anything
                  because we are dependent on volunteer availability.
                </Typography>
                <Controller
                  as={
                    <RadioGroup>
                      <FormControlLabel
                        value="1"
                        control={<Radio />}
                        label="Low"
                      />
                      <FormControlLabel
                        value="5"
                        control={<Radio />}
                        label="Medium - Not very urgent"
                      />
                      <FormControlLabel
                        value="10"
                        control={<Radio />}
                        label="High - Urgent"
                      />
                    </RadioGroup>
                  }
                  control={control}
                  name="immediacy"
                />

                {!!errors.immediacy && (
                  <FormHelperText error>
                    {errors.immediacy.message}
                  </FormHelperText>
                )}

                <Divider className={classes.optionalDivider} />
                <Typography variant="h5" gutterBottom>
                  Your Location
                </Typography>
                <Typography variant="body2" className={classes.intro}>
                  A rough location is needed to allow us to efficiently and
                  quickly find a match for your need. You can either click on
                  the &quot;Detect Location&quot; button below the map or click
                  on the map to specify the location.
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Card>
                      {requestLocationLoading ? (
                        <LoadingSpinner />
                      ) : (
                        <ClickableMap
                          locationInfo={requestLocation}
                          onLocationChange={handleLocationChange}
                        />
                      )}
                    </Card>
                  </Grid>
                </Grid>
                <Divider className={classes.optionalDivider} />
                <Typography variant="h5" gutterBottom>
                  Contact Information
                </Typography>

                <Grid container spacing={2}>
                  <Grid item sm={12} md={6}>
                    <TextField
                      name="firstName"
                      data-test="firstName"
                      type="text"
                      label="First Name"
                      variant="outlined"
                      inputRef={register}
                      error={!!errors.firstName}
                      fullWidth
                      helperText={errors?.firstName?.message}
                    />
                  </Grid>
                  <Grid item sm={12} md={6}>
                    <TextField
                      name="lastName"
                      data-test="lastName"
                      type="text"
                      label="Last Name"
                      variant="outlined"
                      fullWidth
                      inputRef={register}
                      error={!!errors.lastName}
                      helperText={errors?.firstName?.message}
                    />
                  </Grid>
                  <Grid item sm={12} md={6}>
                    <TextField
                      name="phone"
                      data-test="phone"
                      type="text"
                      label="Phone Number"
                      variant="outlined"
                      fullWidth
                      inputRef={register}
                      error={!!errors.phone}
                      helperText={errors?.phone?.message}
                    />
                  </Grid>
                  <Grid item sm={12} md={6}>
                    <TextField
                      name="email"
                      type="text"
                      data-test="email"
                      label="Email"
                      variant="outlined"
                      fullWidth
                      inputRef={register}
                      error={!!errors.email}
                      helperText={errors?.email?.message}
                    />
                  </Grid>
                </Grid>

                {dirty && !!Object.keys(errors).length && !isValid && (
                  <Typography variant="body2" className={classes.errorText}>
                    Please fix the errors above.
                  </Typography>
                )}

                <div className={classes.buttons}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    data-test="submit-request"
                    disabled={isSubmitting}>
                    Submit Request
                  </Button>
                </div>
              </Container>
            </form>
          </Container>
        </div>
      </Paper>
    </Container>
  );
}

export default NewRequestPage;
