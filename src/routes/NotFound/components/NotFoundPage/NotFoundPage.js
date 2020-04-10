import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import HomeIcon from "@material-ui/icons/Home";
import { Button, Container, Grid, Typography, Paper } from "@material-ui/core";
import styles from "./NotFoundPage.styles";

const useStyles = makeStyles(styles);

function NotFoundPage() {
  const classes = useStyles();

  return (
    <>
      <Helmet>
        <title>Page Not Found</title>
      </Helmet>
      <Container maxWidth="md">
        <Paper className={classes.paper}>
          <Typography
            variant="h4"
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
                <Button
                  component={Link}
                  to="/"
                  variant="contained"
                  color="primary"
                  startIcon={<HomeIcon />}
                >
                  Home
                </Button>
              </Grid>
              <Grid item>
                <Button
                  component={Link}
                  to="/contact"
                  variant="outlined"
                  color="primary"
                >
                  Report
                </Button>
              </Grid>
            </Grid>
          </div>
        </Paper>
      </Container>
    </>
  );
}

export default NotFoundPage;
