import { loadable } from 'utils/router';
import { NEW_REQUEST_PATH as path } from 'constants/paths';

export default {
  path,
  component: loadable(() =>
    import(/* webpackChunkName: 'New Request' */ './components/NewRequestPage'),
  ),
};
