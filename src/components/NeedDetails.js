import React, { useEffect }  from "react";
import PropTypes from 'prop-types';
import { Button, Grid, makeStyles, CircularProgress, Typography } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { useSelector, useDispatch } from 'react-redux';
import { loadNeedDetails, releaseNeedAssignment, completeNeedAssignment } from "../modules/needs";

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(3)
  }
}));

function NeedDetails(props) {
  const classes = useStyles();
  const id = props.id;
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
  };

  // const handleShowContactInfo = () => {
  //   dispatch(loadNeedContactInfo(id));
  // };

  let body = null;
  let status = ui.get("status");
  if (status === "loading") {
    body = <CircularProgress />;
  } else if (status === "failed") {
    body = (
      <Alert severity="error" className={classes.alertMessage}>
        {ui.get("error").message}
      </Alert>
    );
  } else if (status === "loaded" && need !== null) {
    body = (
      <React.Fragment>
        <img style={{float: "right"}} alt="Request's location"
          src={`https://maps.googleapis.com/maps/api/staticmap?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&center=${need.getIn(
            ["coordinates", "_latitude"])},${need.getIn(["coordinates", "_longitude"])}&markers=${need.getIn(
            ["coordinates", "_latitude"])},${need.getIn(["coordinates", "_longitude"])}&size=300x300&zoom=10`}
        />

        <Typography variant="caption" gutterBottom>
          DESCRIPTION
        </Typography>
        <Typography variant="h5" gutterBottom>
          {need.get("shortDescription")}
        </Typography>

        <Typography variant="caption" gutterBottom>
          NEEDS
        </Typography>
        <Typography variant="h5" gutterBottom>
          {need.get("needs").map(item => (
            <React.Fragment key={item}>
              {item}
              <br />
            </React.Fragment>
          ))}
        </Typography>

        <Typography variant="caption" gutterBottom>
          REQUESTOR
        </Typography>
        <Typography variant="h6" gutterBottom>
          {need.get("name")}
        </Typography>

        <Typography variant="caption">CONTACT</Typography>
        <Typography variant="h6" gutterBottom>
          {need.get("contactInfo")}
        </Typography>
        {/* {!need.get("contactInfo") ? (
          <Typography variant="body2" gutterBottom>
            For privacy reasons we do not show the contact info right away. To
            see, <Link onClick={handleShowContactInfo}>please click here</Link>.
          </Typography>
        ) : (
          <Typography variant="h6" gutterBottom>
            {need.get("contactInfo")}
          </Typography>
        )} */}

        <Typography variant="caption" gutterBottom>
          OTHER DETAILS
        </Typography>
        <Typography variant="h6" gutterBottom>
          {need.get("otherDetails")
            ? need.get("otherDetails")
            : "No other details provided"}
        </Typography>

        <Grid container spacing={2} className={classes.container}>
          <Grid item xs={10}>
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

          {props.hideActionButtons !== true &&
            need.get("status") !== 20 &&
            user.get("isAuthenticated") === true &&
            user.getIn(["userProfile", "id"]) ===
              need.getIn(["owner", "userProfileId"]) && (
              <React.Fragment>
                {user.getIn(["userProfile", "id"])}
                {need.getIn(["owner", "userProfileId"])}
                <Grid item xs={8} />
                <Grid item xs={2}>
                  <Button fullWidth variant="contained" onClick={handleRelease}>
                    RELEASE
                  </Button>
                </Grid>
                <Grid item xs={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={handleCompletion}
                  >
                    COMPLETE
                  </Button>
                </Grid>
              </React.Fragment>
            )}
        </Grid>
      </React.Fragment>
    );
  }

  return <React.Fragment>{body}</React.Fragment>;
}

NeedDetails.propTypes = {
  id: PropTypes.string.isRequired,
  hideActionButtons: PropTypes.bool
};

export default NeedDetails;