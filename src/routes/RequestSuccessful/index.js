import { loadable } from 'utils/router';
import { REQUEST_SUCCESSFUL_PATH as path } from 'constants/paths';

export default {
  path,
  component: loadable(() =>
    import(
      /* webpackChunkName: 'Request Successful' */ './components/RequestSuccessfulPage'
    ),
  ),
};
