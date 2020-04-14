import React from 'react';
import { Helmet } from 'react-helmet';
import { useUser, useFirestore } from 'reactfire';
import { useForm } from 'react-hook-form';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { validateEmail } from 'utils/form';
import useNotifications from 'modules/notification/useNotifications';
import { CONTACT_COLLECTION } from 'constants/collections';
import styles from './ContactPage.styles';

const useStyles = makeStyles(styles);

function ContactPage() {
  const classes = useStyles();
  const user = useUser();
  const firestore = useFirestore();
  const { FieldValue } = useFirestore;
  const { showError, showSuccess } = useNotifications();
  const {
    register,
    handleSubmit,
    errors,
    formState: { dirty, isSubmitting, isSubmitted },
  } = useForm({
    nativeValidation: false,
  });

  async function submitContactRequest(values) {
    try {
      const contactRequest = {
        ...values,
        createdAt: FieldValue.serverTimestamp(),
      };
      if (user && user.uid) {
        contactRequest.createdBy = user.uid;
      }
      await firestore.collection(CONTACT_COLLECTION).add(contactRequest);
      showSuccess('Message submitted!');
    } catch (err) {
      console.error('Error submiting contact request', err.message) // eslint-disable-line
      showError('Error - please email info@cv19assist.com');
    }
  }

  return (
    <Container maxWidth="md">
      <Helmet>
        <title>Contact</title>
      </Helmet>
      <Typography variant="h5" gutterBottom>
        Contact us
      </Typography>
      <Paper className={classes.paper} data-test="contact-content">
        {isSubmitted ? (
          <Grid container spacing={2} justify="center">
            <Grid item xs={12} md={10} lg={8} className={classes.gridItem}>
              <Typography data-test="submitted-message">
                Your message has been successfully submitted. We will reach out
                shortly. Thanks!
              </Typography>
            </Grid>
          </Grid>
        ) : (
          <form
            onSubmit={handleSubmit(submitContactRequest)}
            data-test="contact-form">
            <Grid container spacing={2} justify="center">
              <Grid item xs={12} md={10} lg={8} className={classes.gridItem}>
                <TextField
                  name="name"
                  label="Name"
                  margin="normal"
                  data-test="name"
                  fullWidth
                  inputRef={register({
                    required: true,
                  })}
                  error={!!errors.name}
                  helperText={errors.name && 'Name must be valid'}
                />
              </Grid>
              <Grid item xs={12} md={10} lg={8} className={classes.gridItem}>
                <TextField
                  type="email"
                  name="email"
                  label="Email"
                  margin="normal"
                  data-test="email"
                  fullWidth
                  inputRef={register({
                    required: true,
                    validate: validateEmail,
                  })}
                  error={!!errors.email}
                  helperText={errors.email && 'Email must be valid'}
                />
              </Grid>
              <Grid item xs={12} md={10} lg={8} className={classes.gridItem}>
                <TextField
                  type="phone"
                  name="phone"
                  label="Phone"
                  data-test="phone"
                  margin="normal"
                  fullWidth
                  inputRef={register}
                  error={!!errors.phone}
                  helperText={errors.phone && 'Phone must be valid'}
                />
              </Grid>
              <Grid item xs={12} md={10} lg={8} className={classes.gridItem}>
                <TextField
                  name="message"
                  label="Message"
                  data-test="message"
                  margin="normal"
                  fullWidth
                  inputRef={register}
                  multiline
                  rows={4}
                />
              </Grid>
            </Grid>
            <Grid
              container
              spacing={2}
              justify="center"
              alignContent="center"
              margin="normal">
              <Grid item xs={2} md={2} lg={2} className={classes.gridItem}>
                <Button
                  color="primary"
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting || !dirty}
                  data-test="submit-contact">
                  {isSubmitting ? 'Loading...' : 'Submit'}
                </Button>
              </Grid>
            </Grid>
          </form>
        )}
      </Paper>
    </Container>
  );
}

export default ContactPage;
