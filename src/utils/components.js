import React from 'react';
import * as Sentry from '@sentry/browser';
import PropTypes from 'prop-types';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  componentDidCatch(error, errorInfo) {
    // Catch errors in any components below and re-render with error message
    this.setState({
      error,
      errorInfo,
    });
    Sentry.captureException({ error, errorInfo });
  }

  render() {
    const { errorInfo, error } = this.state;
    const { errorComponent, children } = this.props;
    if (errorInfo) {
      if (errorComponent) {
        return React.cloneElement(errorComponent, { ...this.state });
      }
      // Error path
      return (
        <div>
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {error && error.toString()}
            <br />
            {errorInfo.componentStack}
          </details>
        </div>
      );
    }
    // Normally, just render children
    return children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.element,
  errorComponent: PropTypes.element,
};

export function withErrorBoundary(errorComponent) {
  return (WrappedComponent) => (props) => {
    return (
      <ErrorBoundary errorComponent={errorComponent}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}
