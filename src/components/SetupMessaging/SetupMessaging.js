import React from 'react';
import { useMessaging, useUser } from 'reactfire';
import { useNotifications } from 'modules/notification';
import initializeMessaging from 'utils/firebaseMessaging';

function LoadMessaging() {
  const messaging = useMessaging();
  const { showSuccess } = useNotifications();
  initializeMessaging({ showSuccess, messaging });
  return null;
}

function SetupMessaging() {
  const user = useUser();
  if (!user || !user.uid) {
    return null;
  }
  return <LoadMessaging />;
}

export default SetupMessaging;
