import React from 'react';
import Typography from '@material-ui/core/Typography';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import { useSelector } from 'react-redux';
import { activeCategoryMap } from '../util/categories';
import { Helmet } from 'react-helmet';

const useStyles = makeStyles(theme => ({
  sectionContainer: {
    marginTop: theme.spacing(2),
    flexGrow: 1,
    align: 'center',
  },
  sectionContentPaper: {
    padding: theme.spacing(2)
  },
  actionButtons: {
    display: "flex",
    flexDirection: "column",
    textAlign: "center",
    "& > a": {
      marginTop: theme.spacing(2)
    }
  },
  sectionContent: {
    // flexGrow: 1,
  },
  header: {
    // background: theme.color
    background: '#3F50B0',
    color: '#ffffff',
    marginTop: theme.spacing(-2),
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(3),
  },
  introText: {
    padding: theme.spacing(2)
  }
}));

function Homepage() {
  const classes = useStyles();
  const user = useSelector(state => state.get("user"));

  return (
    <React.Fragment>
      <Helmet><title>Welcome</title></Helmet>
      <Container className={classes.header} maxWidth="xl">
        <Typography
          component="h5"
          variant="h5"
          align="center"
          // color="textPrimary"
          gutterBottom
        >
          Welcome to the Volunteer
          <br /> Coronavirus Assistance System
        </Typography>
        <Container maxWidth="md">
          <Paper className={classes.introText} elevation={5}>
            <Typography
              id="content-homepage"
              variant="subtitle1"
              align="center"
            >
              The spread of COVID19 is having a huge impact on our lives,
              especially{" "}
              <a
                href="https://www.cdc.gov/coronavirus/2019-ncov/specific-groups/people-at-higher-risk.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                those at high risk
              </a>
              . It is more important now than ever for us to come together and
              support our communities, whether it be material support or
              emotional support. Our goal is to connect those in need with those
              that are able to help and spread positive vibes.
            </Typography>
          </Paper>
        </Container>
      </Container>

      <Container maxWidth="md" className={classes.sectionContainer}>
        <Grid container spacing={2}>
          <Grid item className={classes.sectionContent} xs={12} md={6}>
            <Typography variant="h6">Request Assistance</Typography>
            <Paper className={classes.sectionContentPaper}>
              <Typography variant="body2" gutterBottom>
                Free services for the most at-risk community members. Request
                grocery delivery, prescription pick-up, or a phone call for
                emotional support. We have got you covered!
              </Typography>
              <div className={classes.actionButtons}>
                <Button
                  component={Link}
                  to="/request?type=grocery-pickup"
                  variant="contained"
                  color="primary"
                >
                  {activeCategoryMap["grocery-pickup"].shortDescription}
                </Button>
                <Button
                  component={Link}
                  to="/request?type=emotional-support"
                  variant="outlined"
                  color="primary"
                >
                  {activeCategoryMap["emotional-support"].shortDescription}
                </Button>
                <Button
                  component={Link}
                  to="/request?type=other"
                  variant="outlined"
                  color="primary"
                >
                  {activeCategoryMap["other"].shortDescription}
                </Button>
              </div>
            </Paper>
          </Grid>
          <Grid item className={classes.sectionContent} xs={12} md={6}>
            <Typography variant="h6">Volunteer</Typography>
            <Paper className={classes.sectionContentPaper}>
              <Typography variant="body2" gutterBottom>
                At-risk community members need us now more than ever. Sign up to
                see available requests (like picking up grocery) near you and
                see how you can help keep our communities healthy during this
                pandemic!
              </Typography>

              <div className={classes.actionButtons}>
                <Button
                  component={Link}
                  to="/search"
                  variant="contained"
                  color="primary"
                >
                  {user.get("isAuthenticated")
                    ? "View Requests for Assistance"
                    : "Sign Up"}
                </Button>
              </div>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </React.Fragment>
  );
}

export default Homepage;
