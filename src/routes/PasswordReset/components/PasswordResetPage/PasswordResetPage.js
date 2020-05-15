import React from 'react';
import { validateEmail } from 'utils/form';
import { useAuth } from 'reactfire';
import { useForm } from 'react-hook-form';
import {
  Paper,
  Typography,
  Grid,
  TextField,
  makeStyles,
  Button,
  Container,
} from '@material-ui/core';
import { Helmet } from 'react-helmet';
import useNotifications from 'modules/notification/useNotifications';
import styles from './PasswordResetPage.styles';

const useStyles = makeStyles(styles);

function PasswordReset() {
  const classes = useStyles();
  const auth = useAuth();
  const { showError, showMessage } = useNotifications();

  const {
    register,
    handleSubmit,
    errors,
    getValues,
    formState: { isSubmitting, isValid },
  } = useForm({
    mode: 'onChange',
    nativeValidation: false,
  });

  async function handleLinkSend() {
    try {
      await auth.sendPasswordResetEmail(getValues('email'));
    } catch (err) {
      showError(err.message);
      return;
    }
    showMessage('Email sent.');
  }

  return (
    <Container maxWidth="md">
      <Helmet>
        <title>Password Reset</title>
      </Helmet>
      <Typography variant="h4" gutterBottom>
        Password Reset
      </Typography>

      <div className={classes.root}>
        <Paper className={classes.paper}>
          <form
            className={classes.root}
            onSubmit={handleSubmit(handleLinkSend)}>
            <Grid container justify="center" spacing={1}>
              <Typography gutterBottom>
                Enter your email address, and if you have an account you will
                get emailed a link to reset your password.
              </Typography>
              <Grid container justify="center" spacing={1}>
                <Grid item sm={6}>
                  <TextField
                    type="email"
                    name="email"
                    label="Email"
                    variant="outlined"
                    margin="normal"
                    autoComplete="email"
                    fullWidth
                    inputRef={register({
                      required: true,
                      validate: validateEmail,
                    })}
                    error={!!errors.email}
                    helperText={errors.email && 'Email must be valid'}
                  />
                </Grid>
              </Grid>

              <div className={classes.submit}>
                <Button
                  color="primary"
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting || !isValid}>
                  {isSubmitting ? 'Sending...' : 'Send Link'}
                </Button>
              </div>
            </Grid>
          </form>
        </Paper>
      </div>
    </Container>
  );
}

export default PasswordReset;
