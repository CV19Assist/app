import React, { useState } from "react";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Paper from "@material-ui/core/Paper";
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Card from "@material-ui/core/Card";
import Checkbox from "@material-ui/core/Checkbox";
import Radio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { makeStyles, RadioGroup, FormControl, FormGroup } from "@material-ui/core";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import { Formik, Field, FieldArray } from "formik";
import Location from "./ClickableMap";
import * as Yup from "yup";

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
  // custName: Yup.string().min(2, "Too Short").required("Required"),
  // contactInfo: Yup.string().min(2, "Too Short").required("Required"),
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
const immediacyOptions = [1, 2, 3];

function NeedHelp() {
  const classes = useStyles();
  const [userLocation, setUserLocation] = useState(null);

  const handleLocationChange = (location) => {
    console.log(location);
    setUserLocation(location);
  }

  const handleFormSubmit = (values) => {
    console.log(values);
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
                // checkFood: "",
                // checkHealth: "",
                // checkHousing: "",
                // checkEmotional: "",
                // checkFinancial: "",
                radioNum: "",
                contactInfo: "",
                custName: "",
                otherComments: ""
              }}
            >
              {formik => (
                <form onSubmit={formik.handleSubmit}>
                  <Container>
                    <Grid container spacing={3}>
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
                    </Grid>
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
                          name="otherComments"
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
                      A short explanation.
                    </Typography>
                    <ButtonGroup
                      color="primary"
                      aria-label="outlined primary button group"
                    >
                      <Button>Very Urgent</Button>
                      <Button>Less Urgent</Button>
                      <Button>Not Urgent</Button>
                    </ButtonGroup>
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
                      Location is not required, but highly recommended because
                      it will allow us to match more efficiently. You can click
                      on the map to set your location.
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
                    <Grid container spacing={3}>
                      <Grid item xs={6}>
                        <Field
                          as={TextField}
                          name="contactInfo"
                          type="text"
                          label="Phone or email"
                          placeholder="Phone number, email address or both"
                          variant="outlined"
                          fullWidth
                          error={
                            formik.touched.contactInfo &&
                            !!formik.errors.contactInfo
                          }
                          helperText={formik.errors.contactInfo}
                        />
                      </Grid>
                    </Grid>
                    <Grid container spacing={3}>
                      <Grid item xs={6}>
                        <Field
                          as={TextField}
                          name="custName"
                          type="text"
                          label="Name"
                          variant="outlined"
                          fullWidth
                          error={
                            formik.touched.custName && !!formik.errors.custName
                          }
                          helperText={formik.errors.custName}
                        />
                      </Grid>
                    </Grid>
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