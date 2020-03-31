import React, { useEffect }  from "react";
import PropTypes from 'prop-types';
import { Button, Grid, makeStyles, CircularProgress, Typography, Divider } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { useSelector, useDispatch } from 'react-redux';
import { loadNeedDetails, releaseNeedAssignment, completeNeedAssignment } from "../modules/needs";
import { allCategoryMap } from "../util/categories";
import { cacheLaunchURL } from '../modules/user';
import { push } from 'connected-react-router/immutable';
import Chip from "@material-ui/core/Chip";
import { useLocation } from "react-router-dom";
import { submitForAssignment } from "../modules/needs";
import AcceptIcon from '@material-ui/icons/ThumbUp';
import CompleteIcon from '@material-ui/icons/Check';
import ReleaseIcon from '@material-ui/icons/RemoveCircleOutline';
import LoginIcon from '@material-ui/icons/Add';

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(3),
  },
  actionButton: {
    merginRight: theme.spacing(2),
    merginLeft: theme.spacing(2),
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  }
}));

function NeedDetails(props) {
  const classes = useStyles();
  const id = props.id;
  const dispatch = useDispatch();
  const user = useSelector(state => state.get("user"));
  const ui = useSelector(state => state.getIn(["ui", "needs", "details"]));
  const location = useLocation();
  const need = ui.get("need");

  useEffect(() => {
    dispatch(loadNeedDetails(id));
  }, [dispatch]);

  const handleCompletion = () => {
    if (
      !window.confirm(
        "Currently, you cannot undo completion.  Are you sure that you want to mark this as completed?"
      )
    ) {
      return;
    }
    dispatch(completeNeedAssignment(id));
  };

  const handleRequestAssigment = () => {
    dispatch(submitForAssignment({ id: need.get("id") }));
  };

  const handleRelease = () => {
    dispatch(releaseNeedAssignment(id));
  };

  const handleVolunteerToAccept = () => {
    dispatch(
      cacheLaunchURL(`${location.pathname}${location.search}${location.hash}`)
    );
    dispatch(push("/login"));
  };

  // const handleShowContactInfo = () => {
  //   dispatch(loadNeedContactInfo(id));
  // };

  let body = null;
  let status = ui.get("status");
  let immediacy = 0;
  if (need) {
    immediacy = parseInt(need.get("immediacy"));
  }

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
        <img
          style={{ float: "right" }}
          alt="Request's location"
          src={`https://maps.googleapis.com/maps/api/staticmap?key=${
            process.env.REACT_APP_GOOGLE_MAPS_API_KEY
          }&center=${need.getIn(["coordinates", "_latitude"])},${need.getIn([
            "coordinates",
            "_longitude"
          ])}&markers=${need.getIn(["coordinates", "_latitude"])},${need.getIn([
            "coordinates",
            "_longitude"
          ])}&size=300x300&zoom=10`}
        />

        {/* <Typography variant="caption" gutterBottom>
          DESCRIPTION
        </Typography>
        <Typography variant="h5" gutterBottom>
          {need.get("shortDescription")}
        </Typography> */}

        <Typography variant="caption" gutterBottom>
          NEEDS
        </Typography>
        <Typography variant="h6" gutterBottom>
          {immediacy === 1
            ? "URGENT"
            : immediacy <= 5
            ? "Not very urgent: "
            : "URGENT: "}
          {need.get("needs").map(item => (
            <React.Fragment key={item}>
              {allCategoryMap[item] ? (
                <Chip label={allCategoryMap[item].shortDescription} />
              ) : (
                <Alert severity="error">
                  Could not find '{item}' in all category map.
                </Alert>
              )}
              <br />
            </React.Fragment>
          ))}
        </Typography>

        <Typography variant="caption" gutterBottom>
          REQUESTED
        </Typography>
        <Typography variant="h6" gutterBottom>
          {need.get("createdAt").format("llll")}
        </Typography>

        <Typography variant="caption" gutterBottom>
          REQUESTOR
        </Typography>
        <Typography variant="h6" gutterBottom>
          {need.get("name") ? need.get("name") : need.get("firstName")}
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
        {need.get("otherDetails") ? (
          <Typography variant="h6" gutterBottom>
            {need.get("otherDetails")}
          </Typography>
        ) : (
          <Typography variant="body2" gutterBottom>
            No other details provided.
          </Typography>
        )}

        <Divider className={classes.divider} />

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography color="secondary" align="left" variant="body1">
              PLEASE MAKE SURE THAT YOU MEET THE CRITERIA BELOW BEFORE
              VOLUNTEERING
            </Typography>

            <ul>
              <li>
                I am not exhibiting any symptoms of COVID-19 (cough, fever,
                etc.)
              </li>
              <li>
                I have not come in contact with anyone exhibiting COVID-19
                symptoms in the past 14 days
              </li>
              <li>I have been practicing social distancing</li>
              <li>
                I am not part of the{" "}
                <a
                  href="https://www.cdc.gov/coronavirus/2019-ncov/specific-groups/people-at-higher-risk.html"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  at-risk group
                </a>
              </li>
              <li>
                I am in good overall health and can practice social distancing
                if needed to go to public places.
              </li>
            </ul>
          </Grid>

          {/* If not specifically asked to hide. */}
          {!props.hideActionButtons && (
            <Grid container spacing={2} justify="flex-end">
              {// Completed
              need.get("status") === 20 ? (
                <Grid item>
                  <Alert severity="success">
                    This request has been fulfilled.
                  </Alert>
                </Grid>
              ) : // Not completed
              !user.get("isAuthenticated") ? (
                // Not logged in, not complete
                <Grid item>
                  <Button
                    onClick={handleVolunteerToAccept}
                    variant="contained"
                    color="primary"
                    startIcon={<LoginIcon />}
                  >
                    Please sign up as a volunteer to accept this request
                  </Button>
                </Grid>
              ) : // Logged in, not complete
              need.get("status") === 10 ? (
                // Logged, assigned.
                user.getIn(["userProfile", "id"]) ===
                need.getIn(["owner", "userProfileId"]) ? (
                  // Logged, assigned to current user.
                  <React.Fragment>
                    <Grid item>
                      <Button
                        variant="outlined"
                        className={classes.actionButton}
                        onClick={handleRelease}
                        startIcon={<ReleaseIcon />}
                      >
                        RELEASE
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button
                        className={classes.actionButton}
                        variant="contained"
                        color="primary"
                        onClick={handleCompletion}
                        startIcon={<CompleteIcon />}
                      >
                        COMPLETE
                      </Button>
                    </Grid>
                  </React.Fragment>
                ) : (
                  // Logged, assigned to a DIFFERENT user.
                  <Alert severity="info">
                    Sorry, this is already assigned to another user. The other
                    user will have to first release it before you can take it.
                  </Alert>
                )
              ) : (
                // Logged in, not assigned
                <Grid item>
                  <Button
                    onClick={handleRequestAssigment}
                    variant="contained"
                    color="primary"
                    startIcon={<AcceptIcon />}
                  >
                    Assign to me
                  </Button>
                </Grid>
              )}
            </Grid>
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
