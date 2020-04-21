import { loadable } from 'utils/router';
import { SINGLE_POST_PATH as path } from 'constants/paths';

export default {
  path,
  component: loadable(() =>
    import(/* webpackChunkName: 'SinglePost' */ './components/SinglePostPage'),
  ),
};
