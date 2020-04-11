import { loadable } from 'utils/router';
import { SEARCH_PATH as path } from 'constants/paths';

export default {
  path,
  component: loadable(() =>
    import(/* webpackChunkName: 'Search' */ './components/SearchPage'),
  ),
};
