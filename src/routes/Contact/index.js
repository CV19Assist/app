import { loadable } from 'utils/router';
import { CONTACT_PATH as path } from 'constants/paths';

export default {
  path,
  component: loadable(() =>
    import(/* webpackChunkName: 'Contact' */ './components/ContactPage'),
  ),
};
