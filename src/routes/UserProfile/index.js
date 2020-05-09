import { loadable } from 'utils/router';
import { USER_PROFILE_PATH as path } from 'constants/paths';

export default {
  path,
  component: loadable(() =>
    import(
      /* webpackChunkName: 'User Profile */ './components/UserProfilePage'
    ),
  ),
};
