import { loadable } from 'utils/router';
import { TERMS_OF_SERVICE_PATH as path } from 'constants/paths';

export default {
  path,
  component: loadable(() =>
    import(
      /* webpackChunkName: 'Terms Of Service' */ './components/TermsOfServicePage'
    ),
  ),
};
