import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from 'reactfire';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { validateEmail } from 'utils/form';
import useNotifications from 'modules/notification/useNotifications';
import styles from './LoginForm.styles';

const useStyles = makeStyles(styles);

function LoginForm() {
  const classes = useStyles();
  const auth = useAuth();
  const { showError } = useNotifications();
  const {
    register,
    handleSubmit,
    errors,
    formState: { isSubmitting, isValid },
  } = useForm({
    mode: 'onChange',
    nativeValidation: false,
  });

  function emailLogin(creds) {
    return auth
      .signInWithEmailAndPassword(creds.email, creds.password)
      .catch((err) => showError(err.message));
  }

  return (
    <form className={classes.root} onSubmit={handleSubmit(emailLogin)}>
      <TextField
        type="email"
        name="email"
        placeholder="email"
        margin="normal"
        fullWidth
        inputRef={register({
          required: true,
          validate: validateEmail,
        })}
        error={!!errors.email}
        helperText={errors.email && 'Email must be valid'}
      />
      <TextField
        type="password"
        name="password"
        placeholder="password"
        margin="normal"
        fullWidth
        inputRef={register({
          required: true,
        })}
        error={!!errors.password}
        helperText={errors.password && 'Password is required'}
      />
      <div className={classes.submit}>
        <Button
          color="primary"
          type="submit"
          variant="contained"
          disabled={isSubmitting || !isValid}>
          {isSubmitting ? 'Loading' : 'Login'}
        </Button>
      </div>
    </form>
  );
}

export default LoginForm;
