import * as firebaseTesting from '@firebase/testing';
import morningCentralOriginal from './index';

const context = { timestamp: Date.now() };

const morningCentral = functionsTest.wrap(morningCentralOriginal);
const adminApp = firebaseTesting.initializeAdminApp({
  projectId,
  databaseName: projectId,
});
const originalConsole = console;

describe('morningEmailCentral Schedule Cloud Function (schedule:onRun)', () => {
  beforeEach(async () => {
    // Clear any existing mail templates for morning-unclaimed
    // NOTE: Done instead of full Firestore clear to prevent collisions with other tests
    const mailCollectionSnap = await adminApp
      .firestore()
      .collection('mail')
      .where('template.name', '==', 'morning-unclaimed')
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

  it('requests send of mail for UIDs in notification settings', async () => {
    const userUid = '432ACB';
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
      .set({ morningEmail: [userUid] });
    // Add request to public collection
    await adminApp.firestore().collection('requests').add(requestData);
    // Calling wrapped function with fake context
    await morningCentral(context);

    // Get documents from mail collection to confirm contents
    const mailCollectionSnap = await adminApp
      .firestore()
      .collection('mail')
      .where('template.name', '==', 'morning-unclaimed')
      .limit(1)
      .get();
    // Confirm that doc was added to the mail collection
    expect(mailCollectionSnap.size).to.be.gte(1);
    // Confirm correct template is used
    const mailRequestData = mailCollectionSnap.docs[0].data();
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
