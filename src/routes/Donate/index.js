import { loadable } from 'utils/router';
import { DONATE_PATH as path } from 'constants/paths';

export default {
  path,
  component: loadable(() =>
    import(/* webpackChunkName: 'Donate' */ './components/DonatePage'),
  ),
};
