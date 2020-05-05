import { loadable } from 'utils/router';
import { LOGOUT_PATH as path } from 'constants/paths';

export default {
  path,
  component: loadable(() =>
    import(/* webpackChunkName: 'Logout' */ './components/LogoutPage'),
  ),
};
