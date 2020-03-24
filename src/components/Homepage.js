import React from 'react';
import Typography from '@material-ui/core/Typography';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles(theme => ({
  heroContent: {
    background: theme.palette.background.paper,
    padding: theme.spacing(8, 0, 6)
  },
  heroButtons: {
    marginTop: theme.spacing(4)
  }
}));

function Homepage() {
  const classes = useStyles();

  return (
    <React.Fragment>
      <main>
        <div className={classes.heroContent}>
          <Container maxWidth="md">
            <Typography
              component="h4"
              variant="h4"
              align="center"
              color="textPrimary"
              gutterBottom
            >
              Welcome to the Community Driven<br /> Coronavirus (COVID-19) Pandemic Assistance System
            </Typography>
            <Typography
              id="content-homepage"
              variant="h5"
              align="center"
              color="textSecondary"
              paragraph
            >
              The spread of COVID19 is having a huge impact on our lives,
              especially those at high risk. It is more important now than ever
              for us to come together and support our communities, whether it be
              material support or emotional support. Our goal is to connect
              those in need with those that are able to help and spread positive
              vibes.
            </Typography>
            <div className={classes.heroButtons}>
              <Grid container spacing={2} justify="center">
                <Grid item>
                  <Button
                    component={Link}
                    to="/volunteer"
                    variant="contained"
                    color="primary"
                  >
                    I can provide help
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    component={Link}
                    to="/need-help"
                    variant="contained"
                    color="primary"
                  >
                    I need help
                  </Button>
                </Grid>
              </Grid>
            </div>
          </Container>
        </div>
      </main>
    </React.Fragment>
  );
}

export default Homepage;
