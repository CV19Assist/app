import { loadable } from 'utils/router';
import { PASSWORD_RESET_PATH as path } from 'constants/paths';

export default {
  path,
  component: loadable(() =>
    import(
      /* webpackChunkName: 'Password Reset' */ './components/PasswordResetPage'
    ),
  ),
};
