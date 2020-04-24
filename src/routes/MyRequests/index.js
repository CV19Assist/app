import { loadable } from 'utils/router';
import { MY_REQUESTS_PATH as path } from 'constants/paths';

export default {
  path,
  authRequired: true,
  component: loadable(() =>
    import(/* webpackChunkName: 'My Requests' */ './components/MyRequestsPage'),
  ),
};
