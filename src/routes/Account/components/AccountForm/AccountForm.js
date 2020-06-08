import React from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import { validateEmail } from 'utils/form';
import ProviderDataForm from '../ProviderDataForm';
import styles from './AccountForm.styles';

const useStyles = makeStyles(styles);

function AccountForm({ account, onSubmit }) {
  const classes = useStyles();
  const {
    register,
    handleSubmit,
    errors,
    formState: { isSubmitting, isValid },
  } = useForm({
    mode: 'onChange',
    nativeValidation: false,
    defaultValues: account,
  });

  return (
    <form className={classes.root} onSubmit={handleSubmit(onSubmit)}>
      <div className={classes.fields}>
        <TextField
          name="displayName"
          label="Display Name"
          margin="normal"
          inputRef={register}
          fullWidth
        />
        <TextField
          type="email"
          name="email"
          label="Email"
          margin="normal"
          fullWidth
          inputRef={register({
            required: true,
            validate: validateEmail,
          })}
          error={!!errors.email}
          helperText={errors.email && 'Email must be valid'}
        />
      </div>
      {!!account && !!account.providerData && (
        <div>
          <Typography variant="h6">Linked Accounts</Typography>
          <ProviderDataForm providerData={account.providerData} />
        </div>
      )}
      <div className={classes.settings}>
        <Typography variant="h5">Notification Settings</Typography>
        <FormControlLabel
          control={
            <Switch
              name="emailNotifications"
              color="primary"
              inputRef={register}
              defaultChecked={account?.emailNotifications || false}
            />
          }
          label="Email Notifications"
        />
        <FormControlLabel
          control={
            <Switch
              name="browserNotifications"
              color="primary"
              inputRef={register}
              defaultChecked={account?.browserNotifications || false}
            />
          }
          label="Browser Notifications"
        />
      </div>
      <Button
        color="primary"
        type="submit"
        variant="contained"
        disabled={isSubmitting || !isValid}>
        {isSubmitting ? 'Saving' : 'Save'}
      </Button>
    </form>
  );
}

AccountForm.propTypes = {
  account: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
};

export default AccountForm;
