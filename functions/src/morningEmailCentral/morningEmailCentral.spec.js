import * as firebaseTesting from '@firebase/testing';
import morningCentralOriginal from './index';

const context = { timestamp: Date.now() };

const morningCentral = functionsTest.wrap(morningCentralOriginal);
const adminApp = firebaseTesting.initializeAdminApp({
  projectId,
  databaseName: projectId,
});

describe('morningEmailCentral Schedule Cloud Function (schedule:onRun)', () => {
  beforeEach(async () => {
    // Clean database before each test
    await firebaseTesting.clearFirestoreData({ projectId });
  });

  it('adds user to users_public on create event', async () => {
    const userUid = '123ABC';
    await adminApp
      .firestore()
      .doc('system_settings/notifications')
      .set({ morningEmail: [userUid] }, { merge: true });
    // Calling wrapped function with fake context
    await morningCentral(context);

    // Get documents from mail collection to confirm contents
    const mailCollectionSnap = await adminApp
      .firestore()
      .collection('mail')
      .get();
    // Confirm that doc was added to the mail collection
    expect(mailCollectionSnap.docs).to.have.length(1);
    // Confirm correct template is used
    const mailRequestData = mailCollectionSnap.docs[0].data();
    expect(mailRequestData).to.have.nested.property(
      'template.name',
      'morning-unclaimed',
    );
    // Confirm that uids from system_settings/notifications morningEmail param are set to toUids
    expect(mailRequestData).to.have.property('toUids');
    expect(mailRequestData.toUids[0]).to.equal(userUid);
  });
});
