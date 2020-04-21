import { loadable } from 'utils/router';
import { BLOG_PATH as path } from 'constants/paths';

export default {
  path,
  component: loadable(() =>
    import(/* webpackChunkName: 'Blog' */ './components/BlogPage'),
  ),
};
