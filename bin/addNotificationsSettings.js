#!/usr/bin/env node
/* eslint-disable no-console */
const admin = require('firebase-admin');
const { initFirebase } = require('./utils');

(async function addNotificationsSettings() {
  initFirebase();
  try {
    // Kick off the migration.
    const usersRef = admin.firestore().collection('users');
    const usersSnap = await usersRef.get();
    // eslint-disable-next-line no-await-in-loop, no-restricted-syntax
    for (const userSnap of usersSnap.docs) {
      console.log('Updating user', userSnap.id);
      // eslint-disable-next-line no-await-in-loop
      await userSnap.ref.update({ browserNotifications: true });
    }
    process.exit(0);
  } catch (err) {
    console.log(`Error migrating to new format: ${err.message}`);
    process.exit(1);
  }
})();
