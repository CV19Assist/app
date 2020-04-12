import React from 'react';
import { Helmet } from 'react-helmet';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import styles from './ContactPage.styles';

const useStyles = makeStyles(styles);

function ContactPage() {
  const classes = useStyles();

  return (
    <Container maxWidth="md">
      <Helmet>
        <title>Contact</title>
      </Helmet>
      <Typography variant="h5" gutterBottom>
        Contact us
      </Typography>
      <Paper className={classes.paper} data-test="contact-content">
        <p>
          For any questions or comments, please contact us at{' '}
          <a href="mailto:info@cv19assist.com">info@cv19assist.com</a>.
        </p>
      </Paper>
    </Container>
  );
}

export default ContactPage;
