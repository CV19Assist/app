import React from "react";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Paper from "@material-ui/core/Paper";
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import Checkbox from "@material-ui/core/Checkbox";
import Radio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { makeStyles, RadioGroup, FormControl, FormGroup } from "@material-ui/core";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import { Formik, Field } from "formik";

const useStyles = makeStyles(theme => ({
  heroContent: {
    background: theme.palette.background.paper,
    padding: theme.spacing(8, 0, 6)
  },
  heroButtons: {
    marginTop: theme.spacing(4)
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
  intro: {
    marginBottom: theme.spacing(2),
  },
  radio: {
    marginLeft: theme.spacing(1),
  },
}));

function NeedHelp() {
  const classes = useStyles();

  return (
    <React.Fragment>
      <main>
        <div className={classes.heroContent}>
          <Container maxWidth="md">
            <Typography
              component="h1"
              variant="h2"
              align="center"
              color="textPrimary"
              gutterBottom
            >
              Request Help
            </Typography>
            <Formik
              initialValues={{
                checkFood: "",
                checkHealth: "",
                checkHousing: "",
                checkEmotional: "",
                checkFinancial: "",
                radioNum: "",
                contactInfo: "",
                custName: "",
                otherComments: "",
              }}
            >
              {formik => (
                <form onSubmit={formik.handleSubmit}>
                  <Container>
                    <Grid container spacing={3}>
                      <FormGroup>
                        <Field as={FormControlLabel}
                          control={<Checkbox onChange={formik.handleChange} name="checkFood" />}
                          label="&nbsp; Food/Meal Delivery"
                        />
                        <Field as={FormControlLabel}
                          control={<Checkbox onChange={formik.handleChange} name="checkHealth" />}
                          label="&nbsp; Health Questions"
                        />
                        <Field as={FormControlLabel}
                          control={<Checkbox onChange={formik.handleChange} name="checkHousing" />}
                          label="&nbsp; Housing/Utilities"
                        />
                        <Field as={FormControlLabel}
                          control={<Checkbox onChange={formik.handleChange} name="checkEmotional" />}
                          label="&nbsp; Mental Health/Emotional Support"
                        />
                        <Field as={FormControlLabel}
                          control={<Checkbox onChange={formik.handleChange} name="checkFinancial" />}
                          label="&nbsp; Limited, Immediate Financial Needs"
                        />
                      </FormGroup>
                    </Grid>
                    <Divider className={classes.optionalDivider} />
                    <Typography variant="h5" gutterBottom>
                      Immediacy of Need
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      A short explanation.
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs>
                        <Typography variant="body2" align="right" gutterBottom>
                          Very High
                        </Typography>
                      </Grid>
                      <Grid item xs={9.5}>
                        <FormControl component="fieldset">
                          <Field as={RadioGroup}
                            name="radioNum"
                            row
                            onChange={formik.handleChange}
                          >
                            <FormControlLabel
                              className={classes.radio}
                              value="1"
                              control={<Radio />}
                              label="1"
                              labelPlacement="top"
                            />
                            <FormControlLabel
                              className={classes.radio}
                              value="2"
                              control={<Radio />}
                              label="2"
                              labelPlacement="top"
                            />
                            <FormControlLabel
                              className={classes.radio}
                              value="3"
                              control={<Radio />}
                              label="3"
                              labelPlacement="top"
                            />
                            <FormControlLabel
                              className={classes.radio}
                              value="4"
                              control={<Radio />}
                              label="4"
                              labelPlacement="top"
                            />
                            <FormControlLabel
                              className={classes.radio}
                              value="5"
                              control={<Radio />}
                              label="5"
                              labelPlacement="top"
                            />
                            <FormControlLabel
                              className={classes.radio}
                              value="6"
                              control={<Radio />}
                              label="6"
                              labelPlacement="top"
                            />
                            <FormControlLabel
                              className={classes.radio}
                              value="7"
                              control={<Radio />}
                              label="7"
                              labelPlacement="top"
                            />
                            <FormControlLabel
                              className={classes.radio}
                              value="8"
                              control={<Radio />}
                              label="8"
                              labelPlacement="top"
                            />
                            <FormControlLabel
                              className={classes.radio}
                              value="9"
                              control={<Radio />}
                              label="9"
                              labelPlacement="top"
                            />
                            <FormControlLabel
                              className={classes.radio}
                              value="10"
                              control={<Radio />}
                              label="10"
                              labelPlacement="top"
                            />
                          </Field>
                        </FormControl>
                      </Grid>
                      <Grid item xs>
                        <Typography variant="body2" gutterBottom>
                          Very Low
                        </Typography>
                      </Grid>
                    </Grid>
                    <Divider className={classes.optionalDivider} />
                    <Typography variant="h5" gutterBottom>
                      Location
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={6}>
                        <Card>
                          <Paper variant="outlined">Replace with Map</Paper>
                        </Card>
                        <div className={classes.buttons}>
                          <Button
                            variant="contained"
                            color="primary"
                          >
                            Detect Location
                    </Button>
                        </div>
                      </Grid>
                    </Grid>
                    <Divider className={classes.optionalDivider} />
                    <Grid container spacing={3}>
                      <Grid item xs={6}>
                        <Field as={TextField}
                          name="contactInfo"
                          type="text"
                          label="Contact Information"
                          variant="outlined"
                          fullWidth
                          error={formik.touched.contactInfo && !!formik.errors.contactInfo}
                          helperText={formik.errors.contactInfo}
                        />
                      </Grid>
                    </Grid>
                    <Grid container spacing={3}>
                      <Grid item xs={6}>
                        <Field as={TextField}
                          name="custName"
                          type="text"
                          label="Name"
                          variant="outlined"
                          fullWidth
                          error={formik.touched.custName && !!formik.errors.custName}
                          helperText={formik.errors.custName}
                        />
                      </Grid>
                    </Grid>
                    <Divider className={classes.optionalDivider} />
                    <Typography variant="h5" gutterBottom>
                      Other helpful comments
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={9}>
                        <Field as={TextField}
                          name="otherComments"
                          multiline
                          fullWidth
                          rows="4"
                          variant="outlined"
                        />
                      </Grid>
                    </Grid>
                  </Container>
                </form>
              )}
            </Formik>
          </Container>
        </div>
      </main>
    </React.Fragment>
  );
}

export default NeedHelp;