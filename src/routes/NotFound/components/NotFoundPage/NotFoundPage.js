import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import HomeIcon from '@material-ui/icons/Home';
import styles from './NotFoundPage.styles';

const useStyles = makeStyles(styles);

function NotFoundPage() {
  const classes = useStyles();

  return (
    <>
      <Helmet>
        <title>Page Not Found</title>
      </Helmet>
      <main>
        <div className={classes.heroContent}>
          <Container maxWidth="md">
            <Typography
              component="h1"
              variant="h2"
              align="center"
              color="textPrimary"
              gutterBottom>
              Page Not Found
            </Typography>
            <Typography
              variant="h5"
              align="center"
              color="textSecondary"
              paragraph>
              The page that you are looking for does not exit.
            </Typography>
            <div className={classes.heroButtons}>
              <Grid container spacing={2} justify="center">
                <Grid item>
                  <Button
                    component={Link}
                    to="/"
                    variant="contained"
                    color="primary"
                    startIcon={<HomeIcon />}>
                    Home
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    component={Link}
                    to="/contact"
                    variant="outlined"
                    color="primary">
                    Report
                  </Button>
                </Grid>
              </Grid>
            </div>
          </Container>
        </div>
      </main>
    </>
  );
}

export default NotFoundPage;
