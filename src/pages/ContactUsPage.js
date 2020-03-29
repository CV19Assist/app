import React from "react";
import { makeStyles } from "@material-ui/core";
import { Container, Typography, Paper } from "@material-ui/core";
import { Helmet } from 'react-helmet';

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(2)
  }
}));

function ContactUsPage() {
  const classes = useStyles();

  return (
    <Container maxWidth="md">
      <Helmet><title>Contact</title></Helmet>
      <Typography variant="h5" gutterBottom>
        Contact us
      </Typography>
      <Paper className={classes.paper}>
        <p>
          For any questions or comments, please contact us at{" "}
          <a href="mailto:info@cv19assist.com">info@cv19assist.com</a>.
        </p>
      </Paper>
    </Container>
  );
}

export default ContactUsPage;
