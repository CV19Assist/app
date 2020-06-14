import React from 'react';
import { Link } from 'react-router-dom';
import {
  makeStyles,
  Typography,
  Container,
  Grid,
  Button,
  Paper,
} from '@material-ui/core';
import { Helmet } from 'react-helmet';
import { useUser } from 'reactfire';
import { NEW_REQUEST_PATH, SEARCH_PATH, LOGIN_PATH } from 'constants/paths';
import RequestsMap from './RequestsMap';
import styles from './HomePage.styles';
import HowItWorks from '../HowItWorks/HowItWorks';

const useStyles = makeStyles(styles);

function Homepage() {
  const classes = useStyles();
  const user = useUser();

  return (
    <>
      <Helmet>
        <title>Welcome</title>
      </Helmet>
      <Container className={classes.header} maxWidth={false} disableGutters>
        <Container maxWidth="md" className={classes.introContainer}>
          <Paper className={classes.introText} elevation={4}>
            <Typography
              variant="h5"
              align="center"
              // color="textPrimary"
              gutterBottom
              data-test="welcome-banner">
              Welcome to the Volunteer Coronavirus Assistance System
            </Typography>

            <Typography
              id="content-homepage"
              variant="subtitle1"
              align="center">
              The spread of COVID19 is having a huge impact on our lives,
              especially older adults and people of any age who have underlying
              medical conditions which put them at a higher risk for severe
              illness from COVID-19. It is more important now than ever for us
              to come together and support our communities. Our goal is to
              connect those in such{' '}
              <a
                href="https://www.cdc.gov/coronavirus/2019-ncov/specific-groups/people-at-higher-risk.html"
                target="_blank"
                rel="noopener noreferrer">
                &quot;at-risk population&quot;
              </a>{' '}
              with those that are able to help.
            </Typography>
          </Paper>
        </Container>
      </Container>

      <Container className={classes.sectionContainer}>
        <Grid container spacing={2}>
          <Grid item className={classes.sectionContent} xs={12} md={4}>
            <Typography variant="h6">Request Assistance</Typography>
            <Paper className={classes.sectionContentPaper}>
              <Typography variant="body2" gutterBottom>
                We provide free services for the most at-risk community members.
                Request grocery or prescription delivery, or any other delivery
                assistance. There is no charge for the delivery.
              </Typography>
              <div className={classes.actionButtons}>
                <Button
                  component={Link}
                  to={`${NEW_REQUEST_PATH}?type=grocery-pickup`}
                  variant="contained"
                  color="primary">
                  Grocery Pick-Up
                </Button>
                <Button
                  component={Link}
                  to={`${NEW_REQUEST_PATH}?type=other`}
                  variant="outlined"
                  color="primary">
                  Other
                </Button>
              </div>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Typography variant="h6">Volunteer</Typography>
            <Paper className={classes.volunteerContent}>
              <Typography variant="body2" gutterBottom>
                At-risk community members need us now more than ever. Sign up to
                see available requests (like picking up grocery) near you and
                see how you can help keep our communities healthy during this
                pandemic!
              </Typography>

              <RequestsMap />

              <div className={classes.actionButtons}>
                {user ? (
                  <Button
                    component={Link}
                    to={SEARCH_PATH}
                    variant="contained"
                    color="primary">
                    View Requests for Assistance
                  </Button>
                ) : (
                  <Button
                    component={Link}
                    to={LOGIN_PATH}
                    variant="contained"
                    color="primary">
                    Sign Up
                  </Button>
                )}
              </div>
            </Paper>
          </Grid>

          <HowItWorks />

          <Grid item md={12}>
            <Typography variant="h6">Press Coverage</Typography>
            <Paper className={classes.sectionContentPaper}>
              <Typography variant="body2" gutterBottom>
                Our vision is to help communities across the US. Thanks to our
                volunteers, we are starting to get local media coverage. We
                intend to leverage these opportunities to spread the word,
                especially to our target at-health-risk population.
              </Typography>
              <ul>
                <li>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://madison365.com/local-entrepreneur-develops-volunteer-coronavirus-assistance-system-to-connect-those-in-need-with-volunteers/">
                    Madison 365: Local entrepreneur develops Volunteer
                    Coronavirus Assistance System to connect those in need with
                    volunteers
                  </a>
                </li>
                <li>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://wkow.com/2020/04/05/local-developers-create-website-to-link-volunteers-with-people-in-need-of-help/">
                    WKOW: Local developers create website to link volunteers
                    with people in need of help
                  </a>
                </li>
                <li>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="http://www.unifiednewsgroup.com/verona_press/community/new-website-seeks-to-stop-the-spread/article_4974261c-7d1e-523b-8bbe-14f3c16c0ea8.html">
                    The Verona Press: New website seeks to stop the spread
                  </a>
                </li>
              </ul>
              <Typography variant="body2" gutterBottom>
                Please <Link to="/contact">contact us</Link> if you represent a
                press organization or are connected to one who would be open to
                covering this initiative.
              </Typography>
            </Paper>
          </Grid>

          <Grid item md={12}>
            <Typography variant="h6">Note About Financial Need</Typography>
            <Paper className={classes.sectionContentPaper}>
              <Typography variant="body2" gutterBottom>
                This service is for anyone that falls in the at-risk category,
                regardless of if they can afford groceries or not. If someone
                needs help covering the cost of the items, please let us know in
                the request, and we will do our best to help.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export default Homepage;
