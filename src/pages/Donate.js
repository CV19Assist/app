import React from "react";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core";
import { Container, Typography, Paper, Divider } from "@material-ui/core";
import { Helmet } from 'react-helmet';

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  volunteerHeading: {
    marginTop: theme.spacing(2)
  },
  divider: {
    margin: theme.spacing(3)
  }
}));

function AboutPage() {
  const classes = useStyles();

  return (
    <Container maxWidth="md">
      <Helmet>
        <title>Donate</title>
      </Helmet>
      <Typography variant="h5" gutterBottom>
        Donate
      </Typography>
      <Paper className={classes.paper}>
        <p>
          <span style={{ fontWeight: "bold" }}>Together, apart.</span> CV19
          Assist is a tool for everyone. No matter race, gender, sexual
          orientation, and religion, we all need and can provide help and
          support. We’re coders, designers, business people; we all bring our
          unique talents to this project. That is why we have sought out
          expertise in the charitable space by partnering with faith-based and
          other community organizations.
        </p>
        <p>
          Right now, we’re a logistical network connecting those in need with
          those that can help. But we could do more with your help. The
          financial burden of food is real. And regardless of stimulus and
          government support, there’s always going to be a need. Your donations
          can simplify the entire process for those most in need.
        </p>
      </Paper>
      <Paper className={classes.paper}>
        <Typography variant="subtitle1" gutterBottom>
          Wisconsin Muslim Community
        </Typography>
        <p>
          The Wisconsin Muslim Community is helping to organize and fund the
          COVID-19 Assistance Program to assist all families in need regardless
          of their religion. They have already helped fulfill some of the
          initial needs which required financial assistance.
        </p>
        <p>
          You can send tax deductible donations at{" "}
          <a
            href="https://tinyurl.com/MadisonMCAP"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://tinyurl.com/MadisonMCAP
          </a>{" "}
          or send a check to Madinah Community Center with memo "For COVID-19
          Assistance" at 4718 Hammersley Rd., Madison, WI 53711.
        </p>
        <Divider className={classes.divider} />

        <p>
          Please <Link to="/contact">contact us</Link> if your organization will
          like to help with this initiative and be listed on this page for
          donations.
        </p>
      </Paper>
    </Container>
  );
}

export default AboutPage;
