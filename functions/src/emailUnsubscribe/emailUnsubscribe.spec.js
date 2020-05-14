import * as firebaseTesting from '@firebase/testing';
import emailUnsubscribe from './index';

const adminApp = firebaseTesting.initializeAdminApp({
  projectId,
  databaseName: projectId,
});
const USER_UID = '123ABC';
const USER_EMAIL = 'test@test.com';
const userRef = adminApp.firestore().doc(`users/${USER_UID}`);
const originalConsole = console;

describe('emailUnsubscribe HTTPS Cloud Function', () => {
  beforeEach(() => {
    // Mock console to prevent function logs in test logs
    global.console = {
      log: sinon.spy(),
      error: sinon.spy(),
    };
  });

  after(() => {
    global.console = originalConsole;
  });

  it('Returns error if no query params are included', async () => {
    const req = {};
    const statusSendSpy = sinon.spy();
    // A fake response object
    const res = {
      status: sinon.spy(() => ({
        send: statusSendSpy,
      })),
    };
    // Invoke https function with fake request + response objects
    await emailUnsubscribe(req, res);
    expect(res.status).to.have.been.calledWith(500);
    expect(statusSendSpy).to.have.been.calledWith('Error');
  });

  it('exits if passed email does not match a user', async () => {
    const req = {
      query: {
        email: USER_EMAIL,
      },
    };
    // Remove user to confirm they do not exist
    await userRef.delete();
    // A fake response object
    const statusSendSpy = sinon.spy();
    const res = {
      status: sinon.spy(() => ({
        send: statusSendSpy,
      })),
      send: sinon.spy(),
      end: sinon.spy(),
    };
    // Invoke https function with fake request + response objects
    await emailUnsubscribe(req, res);
    expect(res.status).to.have.been.calledWith(500);
    expect(statusSendSpy).to.have.been.calledWith('Error');
  });

  it('updates user object when passed a valid email', async () => {
    // Add user account with email (so it can be found)
    await userRef.set({ email: USER_EMAIL });
    // A fake request object
    const req = {
      query: {
        email: USER_EMAIL,
      },
    };
    // A fake response object
    const res = {
      writeHead: sinon.spy(),
      end: sinon.spy(),
    };
    // Invoke https function with fake request + response objects
    await emailUnsubscribe(req, res);
    const userSnap = await userRef.get();
    const userData = userSnap.data();
    expect(userData).to.have.property('emailNotifications', false);
    expect(res.end).to.have.been.calledWith(
      'You have been successfully unsubscribed, thank you!',
    );
  });
});
