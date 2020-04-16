import * as firebaseTesting from '@firebase/testing';

after(async () => {
  functionsTest.cleanup();
  // Cleanup all apps (keeps active listeners from preventing JS from exiting)
  await Promise.all(firebaseTesting.apps().map((app) => app.delete()));
});
