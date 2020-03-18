import React from 'react';
import Typography from '@material-ui/core/Typography';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core';
import HomeIcon from '@material-ui/icons/Home';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { Helmet } from "react-helmet";

const useStyles = makeStyles(theme => ({
  heroContent: {
    background: theme.palette.background.paper,
    padding: theme.spacing(8, 0, 6)
  },
  heroButtons: {
    marginTop: theme.spacing(4)
  }
}));

function PageNotFound() {
  const classes = useStyles();

  return (
    <React.Fragment>
      <Helmet><title>Page Not Found</title></Helmet>
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
              Page Not Found
            </Typography>
            <Typography
              variant="h5"
              align="center"
              color="textSecondary"
              paragraph
            >
              The page that you are looking for does not exit.
            </Typography>
            <div className={classes.heroButtons}>
              <Grid container spacing={2} justify="center">
                <Grid item>
                  <Button component={Link} to="/" variant="contained" color="primary" startIcon={<HomeIcon />}>
                    Home
                  </Button>
                </Grid>
                <Grid item>
                  <Button component={Link} to="/contact" variant="outlined" color="primary">
                    Report
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

export default PageNotFound;
