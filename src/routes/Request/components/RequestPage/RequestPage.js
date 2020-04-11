import React from 'react';
import { Helmet } from 'react-helmet';
import * as Yup from 'yup';
import { useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useFirestore } from 'reactfire';
import queryString from 'query-string';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Button from '@material-ui/core/Button';
import Zoom from '@material-ui/core/Zoom';
import Card from '@material-ui/core/Card';
import FormGroup from '@material-ui/core/FormGroup';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import Radio from '@material-ui/core/Radio';
import Container from '@material-ui/core/Container';
import RadioGroup from '@material-ui/core/RadioGroup';
import { makeStyles } from '@material-ui/core/styles';
import { activeCategoryMap } from 'constants/categories';
import { useNotifications } from 'modules/notification';
import styles from './RequestPage.styles';

const useStyles = makeStyles(styles);

const requestValidationSchema = Yup.object().shape({
  firstName: Yup.string().required('Required').min(2, 'Too Short'),
  lastName: Yup.string().required('Required').min(2, 'Too Short'),
  contactInfo: Yup.string().required('Required').min(2, 'Too Short'),
  // shortDescription: Yup.string().required("Required"),
  immediacy: Yup.string().required('Required'),
  // needs: Yup.array().required('Please select at least one support need.'),
  needs: Yup.object().required('Please select at least one support need.'),
  otherComments: Yup.string(),
  needFinancialAssistance: Yup.string(),
});

function Request() {
  const classes = useStyles();
  const location = useLocation();
  const firestore = useFirestore();
  const { FieldValue } = useFirestore;
  const qs = queryString.parse(location.search);
  const { showSuccess, showError } = useNotifications();
  const defaultValues = {};
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
    formState: { isValid, isSubmitting, isSubmitted },
  } = useForm({
    validationSchema: requestValidationSchema,
    defaultValues,
  });
  const currentNeeds = watch('needs');

  async function submitNeed(values) {
    const newNeed = {
      ...values,
      needFinancialAssistance: Boolean(values.needFinancialAssistance),
      immediacy: parseInt(values.immediacy, 10),
      createdAt: FieldValue.serverTimestamp(),
      //   lastUpdatedAt: FieldValue.serverTimestamp(),
    };
    // TODO: Re-enable when map is working again
    // if (!userLocation) {
    //   alert('Please select a location by clicking on the map above.');
    //   return;
    // }

    // newNeed.coordinates = userLocation;
    console.log('Submitting values', newNeed); // eslint-disable-line no-console
    try {
      await firestore.collection('needs').add(newNeed);
      showSuccess('Request submitted!');
    } catch (err) {
      showError(err.message || 'Error submitting request');
    }
  }

  const groceryPickup = currentNeeds && currentNeeds['grocery-pickup'];
  const hasFinancialComponent =
    currentNeeds &&
    (Object.keys(currentNeeds) > 1 || currentNeeds['emotional-support']);
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
            <form onSubmit={handleSubmit(submitNeed)}>
              {/* {console.log(errors)} */}
              <Container>
                <FormGroup>
                  <Typography
                    variant="h5"
                    gutterBottom
                    className={classes.otherComments}>
                    What do you need help with?
                  </Typography>
                  {/* <Typography variant="body1" gutterBottom>
                          If you have multiple needs then please 
                        </Typography> */}
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

                <Typography
                  variant="h5"
                  className={classes.otherComments}
                  gutterBottom={!groceryPickup}>
                  Details
                </Typography>
                <Zoom in={groceryPickup} unmountOnExit>
                  <Typography variant="subtitle1" gutterBottom>
                    For grocery pickup, please provide the list of groceries
                    that you would like the volunteer to purchase. Please be as
                    specific as possible.
                  </Typography>
                </Zoom>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      name="otherDetails"
                      multiline
                      placeholder="Please be as specific as possible."
                      fullWidth
                      rows="4"
                      variant="outlined"
                      inputRef={register}
                    />
                  </Grid>
                </Grid>

                <Zoom in={hasFinancialComponent} unmountOnExit>
                  <div>
                    <Divider className={classes.optionalDivider} />
                    <Typography variant="h5" gutterBottom>
                      Will you be able to pay for your items?
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      This service is free, but the items still cost money. Are
                      you able to pay for your items? If not, we will do our
                      best to match you with organizations and volunteers who
                      can also provide financial assistance.
                    </Typography>
                    <Controller
                      as={
                        <RadioGroup
                          aria-label="Need Financial Assistance"
                          component="fieldset">
                          <FormControlLabel
                            value="true"
                            control={<Radio />}
                            label="Yes, I can pay and only need help with the delivery."
                          />
                          <FormControlLabel
                            value="false"
                            control={<Radio />}
                            label="No, I need help paying for the items."
                          />
                        </RadioGroup>
                      }
                      control={control}
                      onChange={([event]) => event.target.value}
                      name="needFinancialAssistance"
                      defaultValue="true"
                    />
                    {!!errors.needFinancialAssistance && (
                      <FormHelperText error>
                        {errors.needFinancialAssistance}
                      </FormHelperText>
                    )}
                  </div>
                </Zoom>

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
                  defaultValue="2"
                />

                {!!errors.immediacy && (
                  <FormHelperText error>
                    Please select an immediacy.
                  </FormHelperText>
                )}
                {/* <Grid container spacing={3}>
                      <Grid item xs>
                        <Typography variant="body2" align="right" gutterBottom>
                          Very High
                        </Typography>
                      </Grid>
                      <Grid item xs={10}>
                        <FormControl component="fieldset">
                          <Field
                            as={RadioGroup}
                            name="radioNum"
                            row
                            onChange={handleChange}
                          >
                            {immediacyOptions.map((option, index) => (
                              <FormControlLabel
                                key={index}
                                className={classes.radio}
                                value={option}
                                control={<Radio />}
                                label={option}
                                labelPlacement="top"
                              />
                            ))}
                          </Field>
                        </FormControl>
                      </Grid>
                      <Grid item xs>
                        <Typography variant="body2" gutterBottom>
                          Very Low
                        </Typography>
                      </Grid>
                    </Grid> */}
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
                      {/* <Location onLocationChange={handleLocationChange} /> */}
                    </Card>
                  </Grid>
                </Grid>
                <Divider className={classes.optionalDivider} />
                <Typography variant="h5" gutterBottom>
                  Contact Information
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="firstName"
                      type="text"
                      label="First Name"
                      margin="normal"
                      variant="outlined"
                      inputRef={register}
                      error={!!errors.firstName}
                      fullWidth
                      helperText={
                        errors && errors.firstName && errors.firstName.message
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="lastName"
                      type="text"
                      label="Last Name"
                      margin="normal"
                      variant="outlined"
                      fullWidth
                      inputRef={register}
                      error={!!errors.lastName}
                      helperText={
                        errors && errors.firstName && errors.firstName.message
                      }
                    />
                  </Grid>
                </Grid>

                <TextField
                  name="contactInfo"
                  type="text"
                  label="Phone or email"
                  placeholder="Phone number, email address or both"
                  margin="normal"
                  variant="outlined"
                  fullWidth
                  inputRef={register}
                  error={!!errors.contactInfo}
                  helperText={
                    errors && errors.contactInfo && errors.contactInfo.message
                  }
                />

                {!isValid && isSubmitted && (
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

export default Request;
