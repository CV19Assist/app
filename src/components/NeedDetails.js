import React, { useState, useEffect }  from "react";
import { Button, Grid, makeStyles, Paper, Container, CircularProgress, Typography } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from "react-router-dom";
import { loadNeedDetails, releaseNeedAssignment, completeNeedAssignment } from "../modules/needs";

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  smallText:{
    fontSize: "14px",
  },
  container: {
    padding: theme.spacing(3)
  }
}));

export default function NeedDetails() {
  const classes = useStyles();
  const { id } = useParams();
  const dispatch = useDispatch();
  const user = useSelector(state => state.get("user"));
  const ui = useSelector(state => state.getIn(["ui", "needs", "details"]));
  const need = ui.get("need");

  useEffect(() => {
    dispatch(loadNeedDetails(id));
  }, []);

  const handleCompletion = () => {
    dispatch(completeNeedAssignment(id));
  };

  const handleRelease = () => {
    dispatch(releaseNeedAssignment(id));
  }

  let body = null;
  let status = ui.get("status");
  if (status === "loading") {
    body = <CircularProgress />;
  } else if (status === "failed") {
    body = (<Alert severity="error" className={classes.alertMessage}>
      {ui.get("error").message}
    </Alert>);
  } else if (status === "loaded") {
    body = (
      <Grid container spacing={3} className={classes.container}>
        <Grid item xs={8}>
          <Typography variant="h4" color="primary" align="left">
            {need.get("shortDescription")}
          </Typography>
        </Grid>

        {/* <Grid item xs={4}>
          <Typography variant="h3" color="primary" align="right">
            2.5 mi{" "}
          </Typography>
        </Grid> */}

        <Grid item xs={6}>
          <Grid>
            <Typography variant="subtitle2" align="left">
              REQUESTOR
            </Typography>
          </Grid>

          <Grid>
            <Typography variant="h6" align="left">
              {need.get("name")}
            </Typography>
          </Grid>
        </Grid>

        <Grid item xs={6}>
          <Typography variant="h6" align="right">
            Contact
          </Typography>
          <Typography variant="h6" align="right">
            {need.get("contactInfo")}
          </Typography>
        </Grid>

        <Grid item xs={10}>
          {need.get("otherDetails") && (
            <Typography align="left">
              {need.get("otherDetails")}
            </Typography>
          )}

          <Typography variant="h6" align="right">
            Requests: {need.get("needs").map(item => (
              <React.Fragment key={item}>
                {item}<br />
              </React.Fragment>
            ))}
          </Typography>

          {/* <Grid item xs={10}>
            <Typography color="secondary" align="left" variant="body1">
              TASK SPECIFICS GUIDLINES - FOOD DELIVERY
            </Typography>
            <ul>
              <li>
                I am not exhibiting any symptoms of COVID-19 (cough, fever, etc)
              </li>
              <li>I have not traveled out-of-country in the past 14 days</li>
              <li>
                I do not have any underlying medical conditions that increases
                my risk from COVID-19
              </li>
              <li>I have been practicing social distancing</li>
              <li>
                I have not come in contact with a sick person in the past 14
                days
              </li>
            </ul>
          </Grid> */}
        </Grid>

        {need.get("status") !== 20 && (
          <React.Fragment>
            <Grid item xs={8} />
            <Grid item xs={2}>
              <Button fullWidth variant="contained" onClick={handleRelease}>
                RELEASE
              </Button>
            </Grid>
            <Grid item xs={2}>
              <Button fullWidth variant="contained" color="primary" onClick={handleCompletion}>
                COMPLETE
              </Button>
            </Grid>
          </React.Fragment>
        )}
      </Grid>
    );
  }

  return (
    <Container>
      <Paper>
        {body}
      </Paper>
    </Container>
  );
}