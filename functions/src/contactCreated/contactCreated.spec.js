import * as firebaseTesting from '@firebase/testing';
import contactCreatedOriginal from './index';

const adminApp = firebaseTesting.initializeAdminApp({
  projectId: process.env.GCLOUD_PROJECT,
  databaseName: process.env.GCLOUD_PROJECT,
});

const eventPath = 'users';
const USER_UID = 'ZYX345';
const contactCreated = functionsTest.wrap(contactCreatedOriginal);
const originalConsole = console;

describe('contactCreated Firestore Cloud Function (onCreate)', () => {
  beforeEach(async () => {
    // Clear any existing mail templates for contactCreated
    // NOTE: Done instead of full Firestore clear to prevent collisions with other tests
    const mailCollectionSnap = await adminApp
      .firestore()
      .collection('mail')
      .where('template.name', '==', 'contact')
      .get();
    await Promise.all(
      mailCollectionSnap.docs.map((docSnap) => docSnap.ref.delete()),
    );
    // Mock console to prevent function logs in test logs
    global.console = {
      log: sinon.spy(),
      error: sinon.spy(),
    };
  });

  after(() => {
    global.console = originalConsole;
  });

  it('writes request to mail collection when contact is created', async () => {
    const eventData = { message: '' };
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
      .set({ newContacts: [USER_UID] });
    await contactCreated(snap, fakeContext);
    const mailRequestsSnap = await adminApp
      .firestore()
      .collection('mail')
      .where('template.name', '==', 'contact')
      .limit(1)
      .get();
    expect(mailRequestsSnap.size).to.equal(1);
    const firstDoc = mailRequestsSnap.docs[0].data();
    expect(firstDoc).to.have.nested.property('toUids.0', USER_UID);
  });
});
