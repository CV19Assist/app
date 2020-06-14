import React from 'react';
import { Link } from 'react-router-dom';
import {
  makeStyles,
  Typography,
  Box,
  Grid,
  Paper,
  Divider,
} from '@material-ui/core';
import { NEW_REQUEST_PATH } from 'constants/paths';
import styles from './HowItWorks.styles';
import step1Image from './HowItWorks-1.png';
import step2Image from './HowItWorks-2.png';
import step3Image from './HowItWorks-3.png';
import step4Image from './HowItWorks-4.png';

const useStyles = makeStyles(styles);
function HowItWorks() {
  const classes = useStyles();

  return (
    <Paper className={classes.mainSectionPaper}>
      <Typography variant="h6" align="center">
        How it Works
      </Typography>
      <Paper elevation={0} className={classes.goalPaper} align="center">
        <Typography variant="body2" align="center">
          We’re here to help you get the essentials you need. Our goal is to
          make this process as simple as possible. Let us know how we’re doing
        </Typography>
      </Paper>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Box display="flex" justifyContent="center" alignItems="center">
            <img
              className={classes.image}
              src={step1Image}
              alt="laptop with request"
            />
          </Box>
          <Typography
            className={classes.subtitleCard}
            align="center"
            variant="subtitle1"
            gutterBottom>
            Step 1
          </Typography>
          <Typography
            className={classes.subtitleCard}
            align="center"
            variant="subtitle1"
            gutterBottom>
            <Box fontWeight="fontWeightBold">Submit Request</Box>
          </Typography>
          <Typography
            variant="body2"
            align="center"
            className={classes.contentCard}
            gutterBottom>
            Select &quot;Grocery Pick-Up&quot; on the{' '}
            <Link to={NEW_REQUEST_PATH}>Request Assistance</Link> page. Complete
            the form, being sure to list exactly what you need and where you
            need it from.
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box display="flex" justifyContent="center" alignItems="center">
            <img
              className={classes.image}
              src={step2Image}
              alt="cellphone calling a phone"
            />
          </Box>

          <Typography
            className={classes.subtitleCard}
            align="center"
            variant="subtitle1"
            gutterBottom>
            Step 2
          </Typography>
          <Typography
            className={classes.subtitleCard}
            align="center"
            variant="subtitle1"
            gutterBottom>
            <Box fontWeight="fontWeightBold">Wait on the call</Box>
          </Typography>
          <Typography
            variant="body2"
            align="center"
            className={classes.contentCard}
            gutterBottom>
            A CV19 Assist volunteer will contact you to fulfill your delivery
            request. They may ask you for more info to get all the details
            right.
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box display="flex" justifyContent="center" alignItems="center">
            <img className={classes.image} src={step3Image} alt="grocery" />
          </Box>

          <Typography
            className={classes.subtitleCard}
            align="center"
            variant="subtitle1"
            gutterBottom>
            Step 3
          </Typography>
          <Typography
            className={classes.subtitleCard}
            align="center"
            variant="subtitle1">
            <Box fontWeight="fontWeightBold">Discuss Delivery</Box>
          </Typography>
          <Typography
            className={classes.contentCard}
            align="center"
            variant="body2"
            gutterBottom>
            The volunteer will be dropping off your items along with a receipt
            at your doorstep so please discuss with the volunteer a delivery
            date and time that works for you.
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box display="flex" justifyContent="center" alignItems="center">
            <img
              className={classes.image}
              src={step4Image}
              alt="laptop with accepted request"
            />
          </Box>
          <Typography
            className={classes.subtitleCard}
            align="center"
            variant="subtitle1"
            gutterBottom>
            Step 4
          </Typography>
          <Typography
            className={classes.subtitleCard}
            align="center"
            variant="subtitle1">
            <Box fontWeight="fontWeightBold">You Stay Safe</Box>
          </Typography>
          <Typography
            className={classes.contentCard}
            align="center"
            variant="body2"
            gutterBottom>
            Listen for the doorbell/call when the volunteer drops off your
            items. Ta-da! Your request is completed with minimal contact.
          </Typography>
        </Grid>
      </Grid>

      <Divider className={classes.divider} />

      <Grid container spacing={2}>
        <Grid item md={6} xs={12}>
          <Typography variant="h6" gutterBottom>
            Who is this service for?
          </Typography>
          <Typography variant="body2" gutterBottom>
            We want to help everyone in need but in general, CV19-Assist is for
            those who: Are over the age of 60, have a comprimised immune system,
            or otherwise meet the CDC&apos;s{' '}
            <a
              href="https://www.cdc.gov/coronavirus/2019-ncov/specific-groups/people-at-higher-risk.html"
              target="_blank"
              rel="noopener noreferrer">
              &quot;at-risk population&quot;
            </a>{' '}
            criteria.
          </Typography>
          <Typography variant="body2" gutterBottom>
            To help you stay safe, our service will connect you with volunteers
            around you who will be able to complete tasks such as picking up
            groceries or prescription for you and dropping it off at your
            doorstep without making contact.
          </Typography>

          <Typography variant="h6" gutterBottom>
            How much does it cost?
          </Typography>
          <Typography variant="body2" gutterBottom>
            Nothing! Our service is completely free thanks to our hundreds of
            volunteers. You only need to pay for the groceries or other
            essential items being delivered.
          </Typography>
        </Grid>

        <Grid item md={6} xs={12}>
          <Typography variant="h6" gutterBottom>
            How do I pay for my items?
          </Typography>
          <Typography variant="body2" gutterBottom>
            You can choose to pay in one of three ways:
          </Typography>
          <ul>
            <li>
              If the store allows it, call in advance to place the order and{' '}
              <Box component="span" fontWeight="fontWeightBold">
                pay with your credit card
              </Box>{' '}
              over the phone. Let them know someone else will be picking it up
              on your behalf. We highly recomend this option.
            </li>
            <li>
              Give your volunteer{' '}
              <Box component="span" fontWeight="fontWeightBold">
                cash payment
              </Box>{' '}
              before or after they complete the order. Leave the money by the
              front door to avoid physical contact.
            </li>
            <li>
              <Box component="span" fontWeight="fontWeightBold">
                Reimburse{' '}
              </Box>{' '}
              the volunteer using an online payment service such as Paypal or
              Venmo.
            </li>
          </ul>

          <Typography variant="body2" gutterBottom>
            NOTE: If you are experiencing symptoms of COVID-19, we ask that you
            not reimburse your volunteer in cash but via Venmo, Paypal, another
            payment app, or call ahead to the store. Please do not open the door
            until the volunteer has left the premises.
          </Typography>

          <Typography variant="h6" gutterBottom>
            What if I cannot pay?
          </Typography>
          <Typography variant="body2">
            If you need help covering the cost of the items you need. Let us
            know in the request and we will do our best to help with payment.
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default HowItWorks;
