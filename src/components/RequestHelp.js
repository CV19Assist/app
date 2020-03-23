import React, { useState } from "react";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Paper from "@material-ui/core/Paper";
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";
import { RadioGroup } from "formik-material-ui";
import Card from "@material-ui/core/Card";
import Checkbox from "@material-ui/core/Checkbox";
import Radio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import { makeStyles, FormControl, FormGroup } from "@material-ui/core";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import { Formik, Field, FieldArray } from "formik";
import Location from "./ClickableMap";
import * as Yup from "yup";
import { submitNeed } from "../modules/needs";
import { useDispatch, useSelector } from 'react-redux';

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
  paper: {
    paddingTop: theme.spacing(3),
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
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(3)
  },
}));

const requestValidationSchema = Yup.object().shape({
  custName: Yup.string().min(2, "Too Short").required("Required"),
  contactInfo: Yup.string().min(2, "Too Short").required("Required"),
  shortDescription: Yup.string().required("Required"),
  immediacy: Yup.string().required("Required"),
  // needGroup: Yup.array().required("Please select at least one support need."),
  otherComments: Yup.string(),
});

const needOptions = [
  {key: "food", description: "Food/Meal Delivery"},
  {key: "health-question", description: "Health Questions"},
  {key: "housing-utilities", description: "Housing/Utilities"},
  {key: "emotional-support", description: "Mental Health/Emotional Support"},
  {key: "financial-needs", description: "Limited, Immediate Financial Needs"}
];

// const immediacyOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const immediacyOptions = [1, 5, 10];

function NeedHelp() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [userLocation, setUserLocation] = useState(null);

  const handleLocationChange = (location) => {
    // console.log(location);
    setUserLocation(location);
  }

  const handleFormSubmit = (values) => {
    if (!userLocation) {
      alert("Please select a location by clicking on the map above.");
      return;
    }

    // Squash the needs.
    if (!values.needGroup) {
      alert("Please select at least one need.");
      return;
    }
    let selected = values.needGroup.filter(el => {
      return (el != null) && (typeof(el) !== "undefined");
    });
    if (selected.length == 0) {
      alert("Please select at least one need.");
      return;
    }

    let newNeed = {...values};
    newNeed.needs = selected.map(el => el[0]);
    delete newNeed.needGroup;

    newNeed.coordinates = userLocation;
    newNeed.name = values.custName;
    delete newNeed.custName;

    // console.log(values, newNeed);
    dispatch(submitNeed(newNeed));
  }

  return (
    <Container maxWidth="md">
      <Paper className={classes.paper}>
        <div className={classes.heroContent}>
          <Container maxWidth="md">
            <Typography
              component="h1"
              variant="h4"
              align="center"
              color="textPrimary"
              className={classes.header}
              gutterBottom
            >
              Request Help
            </Typography>
            <Formik
              validationSchema={requestValidationSchema}
              onSubmit={handleFormSubmit}
              initialValues={{
                immediacy: "",
                contactInfo: "",
                shortDescription: "",
                custName: "",
                otherDetails: ""
              }}
            >
              {formik => (
                <form onSubmit={formik.handleSubmit}>
                  {/* {console.log(formik.errors)} */}
                  <Container>
                      <FormGroup>
                        <FieldArray
                          name="needGroup"
                          render={errors => (
                            <React.Fragment>
                              {needOptions.map((option, index) => (
                                <Field
                                  key={index}
                                  as={FormControlLabel}
                                  control={
                                    <Checkbox
                                      // onChange={formik.handleChange}
                                      name={`needGroup.${index}`}
                                      value={option.key}
                                    />
                                  }
                                  label={option.description}
                                />
                              ))}
                              {errors.needGroup === "string" && (
                                <Typography
                                  variant="body2"
                                  className={classes.errorText}
                                >
                                  Please select at least one need.
                                </Typography>
                              )}
                            </React.Fragment>
                          )}
                        />

                        {/* TODO: Implement this functionality */}
                        {/* <Field
                        as={FormControlLabel}
                        control={
                          <Checkbox
                            onChange={formik.handleChange}
                            name="checkOther"
                          />
                        }
                        label="&nbsp; Limited, Immediate Financial Needs"
                      /> */}
                      </FormGroup>
                    <Typography variant="h6" gutterBottom className={classes.otherComments}>
                      Short Description
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      Need explanation
                    </Typography>
                    <Field
                      as={TextField}
                      name="shortDescription"
                      type="text"
                      label="Short Description"
                      placeholder="Please provide a short description of your request"
                      margin="normal"
                      variant="outlined"
                      fullWidth
                      error={
                        formik.touched.shortDescription && !!formik.errors.shortDescription
                      }
                      helperText={formik.errors.custName}
                    />
                    <Typography
                      variant="h6"
                      gutterBottom
                      className={classes.otherComments}
                    >
                      Details
                    </Typography>
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
                    <Divider className={classes.optionalDivider} />
                    <Typography variant="h5" gutterBottom>
                      Immediacy of Need
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      Please let us know how urgently you need us to fulfill the
                      request. We will do our best to connect you with a
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
                        value="2"
                        control={<Radio />}
                        label="Medium"
                      />
                      <FormControlLabel
                        value="3"
                        control={<Radio />}
                        label="High"
                      />
                    </Field>
                    {formik.touched.immediacy && !!formik.errors.immediacy && (
                      <FormHelperText error>Please select an immediacy.</FormHelperText>
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
                      A rough location is required to allow us to efficiently
                      and quickly find a match for your need.
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Card>
                          <Location onLocationChange={handleLocationChange} />
                        </Card>
                        {/* TODO: Add support for detection */}
                        {/* <div className={classes.buttons}>
                        <Button variant="contained" color="primary">
                          Detect Location
                        </Button>
                      </div> */}
                      </Grid>
                    </Grid>
                    <Divider className={classes.optionalDivider} />
                    <Typography variant="h5" gutterBottom>
                      Contact Information
                    </Typography>
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
                    <Field
                      as={TextField}
                      name="custName"
                      type="text"
                      label="Name"
                      placeholder="Please provide both first and last names"
                      margin="normal"
                      variant="outlined"
                      fullWidth
                      error={
                        formik.touched.custName && !!formik.errors.custName
                      }
                      helperText={formik.errors.custName}
                    />
                    {!formik.isValid && (
                      <Typography variant="body2" className={classes.errorText}>
                        Please fix the errors above.
                      </Typography>
                    )}
                    <div className={classes.buttons}>
                      <Button type="submit" variant="contained" color="primary">
                        Submit Request
                      </Button>
                    </div>
                  </Container>
                </form>
              )}
            </Formik>
          </Container>
        </div>
      </Paper>
    </Container>
  );
}

export default NeedHelp;