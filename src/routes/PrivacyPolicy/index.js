import { loadable } from 'utils/router';
import { PRIVACY_POLICY_PATH as path } from 'constants/paths';

export default {
  path,
  component: loadable(() =>
    import(
      /* webpackChunkName: 'Privacy Policy' */ './components/PrivacyPolicyPage'
    ),
  ),
};
