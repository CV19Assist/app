import React from 'react';
import { useMessaging, useUser } from 'reactfire';
import useSetupMessaging from './useSetupMessaging';

function LoadMessaging() {
  const { isSupported } = useMessaging;
  const { initializeMessaging } = useSetupMessaging();
  // Only initialize messaging for browsers which have support
  if (isSupported()) {
    initializeMessaging();
  }
  return null;
}

function SetupMessaging() {
  const user = useUser();

  // Render nothing if user is not logged in
  if (!user || !user.uid) {
    return null;
  }

  // Load messaging if user is logged in
  return <LoadMessaging />;
}

export default SetupMessaging;
