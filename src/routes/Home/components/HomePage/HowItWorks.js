import React from 'react';
import {
  makeStyles,
  Typography,
  Box,
  Grid,
  Paper,
  Divider,
} from '@material-ui/core';
import styles from './HowItWorks.styles';

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
              src={`${process.env.PUBLIC_URL}/HowItWorks-1.jpg`}
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
            className={classes.contentCard}
            variant="body2"
            align="center"
            gutterBottom>
            Select “Grocery Pick-Up” on the{' '}
            <Box component="span" fontWeight="fontWeightBold">
              {' '}
              Request Assistance
            </Box>{' '}
            page. Complete the form, being sure to list exactly what you need
            and where you need it from.
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box display="flex" justifyContent="center" alignItems="center">
            <img
              className={classes.image}
              src={`${process.env.PUBLIC_URL}/HowItWorks-2.jpg`}
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
            className={classes.contentCard}
            variant="body2"
            align="center"
            gutterBottom>
            A CV19 Assist volunteer will contact you to fulfill your delivery
            request. They may ask you for more info to get all the details
            correct.
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box display="flex" justifyContent="center" alignItems="center">
            <img
              className={classes.image}
              src={`${process.env.PUBLIC_URL}/HowItWorks-3.jpg`}
              alt="grocery"
            />
          </Box>

          <Typography
            className={classes.subtitleCard}
            align="center"
            variant="subtitle1">
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
            The volunteer will drop off your items along with a receipt at your
            doorstep. Discuss with the volunteer a delivery date and time that
            works for you.
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box display="flex" justifyContent="center" alignItems="center">
            <img
              className={classes.image}
              src={`${process.env.PUBLIC_URL}/HowItWorks-4.jpg`}
              alt="laptop with accepted request"
            />
          </Box>
          <Typography
            className={classes.subtitleCard}
            align="center"
            variant="subtitle1">
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

      <Grid container>
        <Grid item md={6} xs={12}>
          <Typography className={classes.titleIndications} variant="subtitle1">
            <Box fontWeight="fontWeightBold">Who is this service for?</Box>{' '}
          </Typography>
          <Typography variant="body2" className={classes.contentIndications}>
            {' '}
            We want to help everyone in need but in general, CV19-Assist is for
            those who: Are over the age of 60, have a comprimised immune system,
            or otherwise meet the CDC’s at-risk population criteria
          </Typography>
          <Typography variant="body2" className={classes.contentIndications}>
            {' '}
            To help you stay safe, our service will connect you with volunteers
            around you who will be able to complete tasks such as picking up
            groceries or prescription for you and dropping it off at your
            doorstep without making contact.{' '}
          </Typography>
          <Typography variant="subtitle1" className={classes.titleIndications}>
            <Box fontWeight="fontWeightBold">How much does it cost?</Box>{' '}
          </Typography>
          <Typography variant="body2" className={classes.contentIndications}>
            {' '}
            Nothing! Our service is completly free thanks to our hundreds of
            volunteers. You only need pay for the groceries or other essential
            items being delivered.{' '}
          </Typography>
        </Grid>
        <Grid item md={6} xs={12}>
          <Typography variant="subtitle1" className={classes.titleIndications}>
            <Box component="span" fontWeight="fontWeightBold">
              How do I pay for my items?
            </Box>{' '}
          </Typography>
          <Typography variant="body2" className={classes.contentIndications}>
            You can choose to pay in one of three ways:
          </Typography>
          <Typography variant="body2" className={classes.contentIndications}>
            • If the store allows it, call in advance to place the order and{' '}
            <Box component="span" fontWeight="fontWeightBold">
              pay with your credit card
            </Box>{' '}
            over the phone. Let them know someone else will be picking it up on
            your behalf. We highly recomend this option.
          </Typography>
          <Typography variant="body2" className={classes.contentIndications}>
            • Give your volunteer{' '}
            <Box component="span" fontWeight="fontWeightBold">
              cash payment
            </Box>{' '}
            before or after they complete the order. Leave the money by the
            front door to avoid physical contact.
          </Typography>
          <Typography variant="body2" className={classes.contentIndications}>
            •
            <Box component="span" fontWeight="fontWeightBold">
              {' '}
              Reimburse{' '}
            </Box>{' '}
            the volunteer using an online payment service such as Paypal or
            Venmo.
          </Typography>

          <Typography variant="body2" className={classes.contentIndications}>
            NOTE: If you are experiencing symptoms of COVID-19, we ask that you
            not reimburse your volunteer in cash but via Venmo, another payment
            app, or call ahead to the store. Please do not open the door until
            the volunteer has left the premises.
          </Typography>
          <Typography variant="subtitle1" className={classes.titleIndications}>
            <Box fontWeight="fontWeightBold">What if I cannot pay?</Box>
          </Typography>
          <Typography variant="body2" className={classes.contentIndications}>
            If you need help covering the cost of the items you need. Let us
            know in the request and we will do our best to help with payment.
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default HowItWorks;
