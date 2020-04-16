import * as firebaseTesting from '@firebase/testing';
import { PubSub } from '@google-cloud/pubsub';
import requestCreatedOriginal from './index';

const pubSubClient = new PubSub();
const USER_UID = '123ABC';
const context = {
  params: { userId: USER_UID },
};

const requestCreated = functionsTest.wrap(requestCreatedOriginal);
const topic = pubSubClient.topic('sendFcm').subscription('asdf');

const messageHandler = (message) => {
  expect(message).to.have.nested.property('data.test');
};
const adminApp = firebaseTesting.initializeAdminApp({
  projectId,
  databaseName: projectId,
});

describe.skip('requestCreated PubSub Cloud Function (pubsub:onPublish)', () => {
  beforeEach(async () => {
    // Clean database before each test
    await firebaseTesting.clearFirestoreData({ projectId });
  });

  after(async () => {
    functionsTest.cleanup();
    // Cleanup all apps (keeps active listeners from preventing JS from exiting)
    await Promise.all(firebaseTesting.apps().map((app) => app.delete()));
    topic.removeListener('message', messageHandler);
  });

  it('adds user to users_public on create event', async () => {
    const requestObj = { displayName: 'some', email: 'test@test.com' };
    await adminApp
      .firestore()
      .doc('system_settings/notifications')
      .set({ newRequests: ['123ABC'] }, { merge: true });
    const snap = functionsTest.firestore.makeDocumentSnapshot(
      requestObj,
      'requests',
    );
    topic.on('message', messageHandler);
    // Calling wrapped function with fake snap and context
    await requestCreated(snap, context);
    // Listen for new messages until timeout is hit
    // Load data to confirm user has been deleted
  });
});
