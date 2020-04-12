import React from 'react';
import Typography from '@material-ui/core/Typography';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core';
import HomeIcon from '@material-ui/icons/Home';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { Helmet } from 'react-helmet';
import styles from './RequestSuccessfulPage.styles';

const useStyles = makeStyles(styles);

function RequestSuccessfulPage() {
  const classes = useStyles();

  return (
    <>
      <Helmet>
        <title>Request Submitted</title>
      </Helmet>
      <Container maxWidth="md">
        <Typography variant="h5" gutterBottom>
          We have sucessfully submitted your request
        </Typography>
        <Paper className={classes.container}>
          <Typography variant="h5" color="textSecondary" paragraph>
            Here’s what to expect:
          </Typography>

          <ol>
            <li>
              You’ll get a phone call from a volunteer in your area who will be
              assisting with your task, so you can confirm for them exactly what
              you need and where you need it from.
            </li>
            <li>
              If you are asking the volunteer to buy something for you, you can
              choose to pay in one of three ways:
              <ol>
                <li>
                  Call the store in advance to place the order and pay with your
                  credit card over the phone, letting them know someone else
                  will be picking it up on your behalf.
                </li>
                <li>
                  Provide your volunteer with cash before or after they complete
                  the order. Make sure to leave the cash by the front door to
                  avoid physical contact.
                </li>
                <li>
                  Reimburse the volunteer using an online method such as Paypal
                  or Venmo.
                </li>
              </ol>
            </li>
            <li>
              Whatever payment method you select, your volunteer will include
              your receipt in the delivery bag and leave the bag at your
              doorstep, ringing your bell so you know it has arrived.
            </li>
          </ol>

          {/* TODO: do we really want to provide any guidance for folks that are experiencing symptoms?
        <Typography>
          PLEASE NOTE: If you are experiencing symptoms of COVID-19, we ask that
          you not reimburse your volunteer in cash but through Venmo, another
          payment app, or call ahead to the store. Please do not open the door
          until the volunteer has left the premises.
        </Typography> */}

          <div className={classes.buttons}>
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
            </Grid>
          </div>
        </Paper>
      </Container>
    </>
  );
}

export default RequestSuccessfulPage;