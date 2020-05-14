import * as firebaseTesting from '@firebase/testing';
import * as admin from 'firebase-admin';

after(async () => {
  functionsTest.cleanup();
  // Cleanup all apps (keeps active listeners from preventing JS from exiting)
  await Promise.all(firebaseTesting.apps().map((app) => app.delete()));
  await Promise.all(admin.apps.map((app) => app.delete()));
});
