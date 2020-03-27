import React from 'react';
import Typography from '@material-ui/core/Typography';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import { useSelector } from 'react-redux';

const useStyles = makeStyles(theme => ({
  sectionContainer: {
    marginTop: theme.spacing(2),
    flexGrow: 1,
    align: 'center',
  },
  sectionContentPaper: {
    padding: theme.spacing(2)
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
      <Container className={classes.header} maxWidth="xl">
        <Typography
          component="h5"
          variant="h5"
          align="center"
          // color="textPrimary"
          gutterBottom
        >
          Welcome to the Community Driven
          <br /> Coronavirus (COVID-19) Pandemic Assistance System
        </Typography>
        <Container maxWidth="md">
          <Paper className={classes.introText} elevation={5}>
            <Typography
              id="content-homepage"
              variant="subtitle1"
              align="center"
              color="textSecondary"
            >
              The spread of COVID19 is having a huge impact on our lives,
              especially those at high risk. It is more important now than ever
              for us to come together and support our communities, whether it be
              material support or emotional support. Our goal is to connect
              those in need with those that are able to help and spread positive
              vibes.
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
                Etiam id ultricies lectus. Suspendisse ullamcorper erat nec
                aliquet maximus. Pellentesque non lacus elit. Proin non velit
                sit amet eros mattis hendrerit. Donec a sagittis sapien. Aliquam
                porttitor augue eu augue varius, sit amet sagittis erat
                sollicitudin. Curabitur at pellentesque tortor. Maecenas felis
                dolor, tempor nec augue et, scelerisque egestas orci. Vivamus
                quis sollicitudin quam. Vivamus felis nisl, consectetur ut
                molestie vitae, luctus ut purus. Praesent facilisis convallis
                blandit. Integer pellentesque, velit quis fermentum venenatis,
                erat orci scelerisque dui, at aliquam enim libero sed diam.
                Aliquam non lorem erat. Aenean pulvinar tincidunt mi, quis
                semper erat vestibulum id. Ut ac vulputate elit. Vestibulum
                consequat vulputate urna, ac porta massa mattis vel.
              </Typography>
              <Button
                component={Link}
                to="/need-help"
                variant="contained"
                color="primary"
              >
                Request Assistance
              </Button>
            </Paper>
          </Grid>
          <Grid item className={classes.sectionContent} xs={12} md={6}>
            <Typography variant="h6">Volunteer</Typography>
            <Paper className={classes.sectionContentPaper}>
              <Typography variant="body2" gutterBottom>
                Etiam id ultricies lectus. Suspendisse ullamcorper erat nec
                aliquet maximus.
                <br />
                Pellentesque non lacus elit. Proin non velit sit amet eros
                mattis hendrerit. Donec a sagittis sapien.
              </Typography>

              <Button
                component={Link}
                to="/volunteer"
                variant="contained"
                color="primary"
              >
                {user.get("isAuthenticated") ? "View Requests for Help" : "Sign Up"}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </React.Fragment>
  );
}

export default Homepage;
