import { useEffect } from 'react';
import { useAnalytics } from 'reactfire';
import { useLocation } from 'react-router-dom';

export default function AnalyticsPageViewLogger() {
  const location = useLocation();
  const analytics = useAnalytics();
  window.analytics = analytics;
  console.log('page view logger');
  // By passing `location.pathname` to the second argument of `useEffect`,
  // we only log on first render and when the `pathname` changes
  useEffect(() => {
    console.log('page view', location.pathname);
    analytics.logEvent('page-view', { path_name: location.pathname });
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
