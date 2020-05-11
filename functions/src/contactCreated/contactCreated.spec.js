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
  // Skipped because test will sometimes timeout within CI as seen
  // here: https://github.com/CV19Assist/app/runs/621415013?check_suite_focus=true#step:8:78
  it('writes request to mail collection when contact is created', async function () {
    this.retries(3);
    this.timeout(5000);
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
      .set({ newContacts: [userUid] }, { merge: true });
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
