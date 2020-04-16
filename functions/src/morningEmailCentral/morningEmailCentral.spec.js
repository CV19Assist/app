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

  it('requests send of mail for UIDs in notification settings', async () => {
    const userUid = '123ABC';
    const firstName = 'some';
    const requestData = {
      createdBy: userUid,
      createdByInfo: { firstName },
      status: 1,
      generalLocationName: 'Some Place, MI',
    };
    // Add notification setting for user
    await adminApp
      .firestore()
      .doc('system_settings/notifications')
      .set({ morningEmail: [userUid] }, { merge: true });
    // Add request to public collection
    await adminApp
      .firestore()
      .collection('requests_public')
      .add({ d: requestData });
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
    expect(mailRequestData).to.have.nested.property('toUids.0', userUid);
    expect(mailRequestData).to.have.nested.property('template.data');
    expect(mailRequestData).to.have.nested.property(
      'template.data.projectDomain',
    );
    expect(mailRequestData).to.have.nested.property('template.data.timestamp');
    expect(mailRequestData).to.have.nested.property('template.data.requests');
    expect(mailRequestData).to.have.nested.property(
      'template.data.requests.0.createdBy',
      requestData.createdBy,
    );
    expect(mailRequestData).to.have.nested.property(
      'template.data.requests.0.generalLocationName',
      requestData.generalLocationName,
    );
  });
});
