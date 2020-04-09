import React, { useState } from "react";
import { Helmet } from 'react-helmet';
import { RadioGroup } from "formik-material-ui";
import {
  Card,
  Zoom,
  Button,
  Radio,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  makeStyles,
  FormGroup,
  Container,
  Typography,
  TextField,
  Paper,
  Divider,
  Grid,
} from "@material-ui/core";
import { Formik, Field, FieldArray } from "formik";
import Location from "./ClickableMap";
import * as Yup from "yup";
import { submitNeed } from "../modules/needs";
import { useDispatch } from 'react-redux';
import { activeCategoryMap } from "../util/categories";
import { useLocation } from "react-router-dom";
import queryString from 'query-string';

const useStyles = makeStyles(theme => ({
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(3)
  },
  paper: {
    // paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(1)
  },
  optionalDivider: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
  },
  intro: {
    marginBottom: theme.spacing(2),
  },
  errorText: {
    color: 'red',
    fontWeight: 'bold',
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(1)
  },
  otherComments: {
    marginTop: theme.spacing(4)
  },
  radio: {
    marginLeft: theme.spacing(1),
  },
}));

const requestValidationSchema = Yup.object().shape({
  firstName: Yup.string().min(2, "Too Short").required("Required"),
  lastName: Yup.string().min(2, "Too Short").required("Required"),
  contactInfo: Yup.string().min(2, "Too Short").required("Required"),
  // shortDescription: Yup.string().required("Required"),
  immediacy: Yup.string().required("Required"),
  needs: Yup.array().required("Please select at least one support need."),
  otherComments: Yup.string(),
  needFinancialAssistance: Yup.string(),
});

function NeedHelp() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [userLocation, setUserLocation] = useState(null);
  const location = useLocation();

  const handleLocationChange = location => {
    // console.log(location);
    setUserLocation(location);
  };

  const handleFormSubmit = values => {
    // console.log(values);
    if (!userLocation) {
      alert("Please select a location by clicking on the map above.");
      return;
    }

    let newNeed = { ...values };
    newNeed.coordinates = userLocation;
    // console.log(values, newNeed);
    dispatch(submitNeed(newNeed));
  };

  const initialValues = {
    immediacy: "",
    contactInfo: "",
    firstName: "",
    lastName: "",
    otherDetails: "",
    needFinancialAssistance: "false",
    needs: []
  };
  if (location.search) {
    let qs = queryString.parse(location.search);
    if (qs.type) {
      // Do something here.
      let specified = qs.type;
      Object.keys(activeCategoryMap).forEach(key => {
        if (key === specified) {
          initialValues.needs.push(key);
        }
      });
      // console.log(initialValues);
    }
  }

  return (
    <Container maxWidth="md">
      <Helmet>
        <title>Request Assistance</title>
      </Helmet>
      <Typography variant="h5" color="textPrimary" gutterBottom>
        Request Help
      </Typography>
      <Paper className={classes.paper}>
        <div className={classes.heroContent}>
          <Container maxWidth="md">
            <Formik
              validationSchema={requestValidationSchema}
              onSubmit={handleFormSubmit}
              initialValues={initialValues}
            >
              {(formik) => {
                const groceryPickup = formik.values.needs.indexOf("grocery-pickup") > -1;
                const hasFinancialComponent =
                  formik.values.needs.length > 1 ||
                  (formik.values.needs.indexOf("emotional-support") === -1);
                return (
                  <form onSubmit={formik.handleSubmit}>
                    {/* {console.log(formik.errors)} */}
                    <Container>
                      <FormGroup>
                        <Typography
                          variant="h5"
                          gutterBottom
                          className={classes.otherComments}
                        >
                          What do you need help with?
                        </Typography>
                        {/* <Typography variant="body1" gutterBottom>
                          If you have multiple needs then please 
                        </Typography> */}
                        <FieldArray
                          name="needs"
                          render={(errors) => (
                            <React.Fragment>
                              {Object.keys(activeCategoryMap).map(
                                (optionKey, index) => (
                                  <Field name="needs" key={index}>
                                    {({ field, form }) => (
                                      <FormControlLabel
                                        label={
                                          activeCategoryMap[optionKey].inputCaption ?
                                          activeCategoryMap[optionKey].inputCaption :
                                          activeCategoryMap[optionKey].description
                                        }
                                        control={
                                          <Checkbox
                                            checked={
                                              field.value &&
                                              field.value.includes(optionKey)
                                            }
                                            onChange={field.onChange}
                                            name={field.name}
                                            value={optionKey}
                                          />
                                        }
                                      />
                                    )}
                                  </Field>
                                )
                              )}
                              {formik.errors.needs && (
                                <FormHelperText error>
                                  {formik.errors.needs}
                                </FormHelperText>
                              )}
                            </React.Fragment>
                          )}
                        />
                      </FormGroup>

                      <Typography
                        variant="h5"
                        className={classes.otherComments}
                        gutterBottom={!groceryPickup}
                      >
                        Details
                      </Typography>
                      <Zoom in={groceryPickup} unmountOnExit>
                        <Typography variant="subtitle1" gutterBottom>
                          For grocery pickup, please provide the list
                          of groceries that you would like the volunteer to
                          purchase. Please be as specific as possible.
                        </Typography>
                      </Zoom>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Field
                            as={TextField}
                            name="otherDetails"
                            multiline
                            placeholder="Please be as specific as possible."
                            fullWidth
                            rows="4"
                            variant="outlined"
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
                            This service is free, but the items still cost
                            money. Are you able to pay for your items? If not,
                            we will do our best to match you with organizations
                            and volunteers who can also provide financial
                            assistance.
                          </Typography>
                          <Field
                            component={RadioGroup}
                            name="needFinancialAssistance"
                          >
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
                          </Field>
                          {formik.touched.needFinancialAssistance &&
                            !!formik.errors.needFinancialAssistance && (
                              <FormHelperText error>
                                {formik.errors.needFinancialAssistance}
                              </FormHelperText>
                            )}
                        </div>
                      </Zoom>

                      <Divider className={classes.optionalDivider} />
                      <Typography variant="h5" gutterBottom>
                        Immediacy of Need
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        Please let us know how urgently you need us to fulfill
                        the request. We will do our best to connect you with a
                        volunteer as soon as possible, however, we cannot
                        guarantee anything because we are dependent on volunteer
                        availability.
                      </Typography>
                      <Field component={RadioGroup} name="immediacy">
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
                      </Field>
                      {formik.touched.immediacy &&
                        !!formik.errors.immediacy && (
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
                            onChange={formik.handleChange}
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
                        A rough location is needed to allow us to efficiently
                        and quickly find a match for your need. You can either
                        click on the "Detect Location" button below the map or
                        click on the map to specify the location.
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Card>
                            <Location onLocationChange={handleLocationChange} />
                          </Card>
                        </Grid>
                      </Grid>
                      <Divider className={classes.optionalDivider} />
                      <Typography variant="h5" gutterBottom>
                        Contact Information
                      </Typography>

                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Field
                            as={TextField}
                            name="firstName"
                            type="text"
                            label="First Name"
                            margin="normal"
                            variant="outlined"
                            error={
                              formik.touched.firstName &&
                              !!formik.errors.firstName
                            }
                            fullWidth
                            helperText={formik.errors.firstName}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Field
                            as={TextField}
                            name="lastName"
                            type="text"
                            label="Last Name"
                            margin="normal"
                            variant="outlined"
                            fullWidth
                            error={
                              formik.touched.lastName &&
                              !!formik.errors.lastName
                            }
                            helperText={formik.errors.lastName}
                          />
                        </Grid>
                      </Grid>

                      <Field
                        as={TextField}
                        name="contactInfo"
                        type="text"
                        label="Phone or email"
                        placeholder="Phone number, email address or both"
                        margin="normal"
                        variant="outlined"
                        fullWidth
                        error={
                          formik.touched.contactInfo &&
                          !!formik.errors.contactInfo
                        }
                        helperText={formik.errors.contactInfo}
                      />

                      {!formik.isValid && (
                        <Typography
                          variant="body2"
                          className={classes.errorText}
                        >
                          Please fix the errors above.
                        </Typography>
                      )}

                      <div className={classes.buttons}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          disabled={formik.isSubmitting}
                        >
                          Submit Request
                        </Button>
                      </div>
                    </Container>
                  </form>
                );}}
            </Formik>
          </Container>
        </div>
      </Paper>
    </Container>
  );
}

export default NeedHelp;