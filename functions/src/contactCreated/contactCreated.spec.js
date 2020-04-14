import * as firebaseTesting from '@firebase/testing';
import contactCreatedOriginal from './index';

const adminApp = firebaseTesting.initializeAdminApp({
  projectId: process.env.GCLOUD_PROJECT,
  databaseName: process.env.GCLOUD_PROJECT,
});

const eventPath = 'users';

const contactCreated = functionsTest.wrap(contactCreatedOriginal);

describe('contactCreated Firestore Cloud Function (onCreate)', () => {
  beforeEach(async () => {
    // Clean database before each test
    await firebaseTesting.clearFirestoreData({
      projectId: process.env.GCLOUD_PROJECT,
    });
  });

  after(async () => {
    // Restoring stubs to the original methods
    functionsTest.cleanup();
    // Cleanup all apps (keeps active listeners from preventing JS from exiting)
    await Promise.all(firebaseTesting.apps().map((app) => app.delete()));
  });

  it('writes request to mail collection when contact is created', async () => {
    const eventData = { message: '' };
    const userUid = '123ABC';
    // Build onCreate
    const snap = functionsTest.firestore.makeDocumentSnapshot(
      eventData,
      eventPath,
    );
    const fakeContext = {
      params: { requestId: '123ASDF' },
    };
    await adminApp
      .firestore()
      .doc('system_settings/notifications')
      .set({ newContacts: [userUid] });
    await contactCreated(snap, fakeContext);
    const mailRequestsSnap = await adminApp
      .firestore()
      .collection('mail')
      .get();
    expect(mailRequestsSnap.docs).to.have.length(1);
    const firstDoc = mailRequestsSnap.docs[0].data();
    expect(firstDoc).to.have.nested.property('template.name', 'contact');
    expect(firstDoc).to.have.nested.property('toUids.0', userUid);
  });
});
