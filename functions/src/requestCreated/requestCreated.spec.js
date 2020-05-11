import * as firebaseTesting from '@firebase/testing';
import functionsTestSetup from 'firebase-functions-test';
// import { GeoFirestore } from 'geofirestore';
import { PubSub } from '@google-cloud/pubsub';
import requestCreatedOriginal from './index';

// Creates a client; cache this for further use
const pubSubClient = new PubSub();

const REQUEST_ID = '123ABC';
const context = {
  params: { requestId: REQUEST_ID },
};
// Setup firebase-functions-tests to online mode (will communicate with emulators)
const functionsTest = functionsTestSetup({
  databaseURL: `https://${projectId}.firebaseio.com`, // Can not be emulator
  storageBucket: `${projectId}.appspot.com`,
  projectId,
});
const requestCreated = functionsTest.wrap(requestCreatedOriginal);

const adminApp = firebaseTesting.initializeAdminApp({
  projectId,
  databaseName: projectId,
});

const DEFAULT_LATITUDE = 43.074585;
const DEFAULT_LONGITUDE = -89.384182;

const subscriptionName = 'gcf-sendFcm-us-central1-sendFcm';
const topicName = 'sendFcm';

/**
 * Create sendFcm topic within PubSub emulator
 */
async function createTopic() {
  // Creates a new topic
  try {
    await pubSubClient.createTopic(topicName);
  } catch (err) {
    if (!err.message.includes('Topic already exists')) {
      throw err;
    }
  }
}

/**
 *
 */
async function createSubscription() {
  // Creates a new subscription
  try {
    await pubSubClient.topic(topicName).createSubscription(subscriptionName);
  } catch (err) {
    if (!err.message.includes('Subscription already exists')) {
      throw err;
    }
  }
  console.log(`Subscription ${subscriptionName} created.`);
}

describe('requestCreated PubSub Cloud Function (pubsub:onPublish)', () => {
  beforeEach(async () => {
    // Clean database before each test
    await firebaseTesting.clearFirestoreData({ projectId });
  });

  it('exits if general location does not exist', async () => {
    const requestObj = { some: 'data' };
    const snap = functionsTest.firestore.makeDocumentSnapshot(
      requestObj,
      `requests/${REQUEST_ID}`,
    );
    // Calling wrapped function with fake snap and context
    const result = await requestCreated(snap, context);
    expect(result).to.be.null;
  });

  it('exits if no users are nearby request', async () => {
    // TODO: Switch to a Geopoint once it is supported for Firebase testing
    // const requestObj = { generalLocation: new admin.firestore.GeoPoint(0, 0) };
    const requestObj = {
      preciseLocation: {
        latitude: DEFAULT_LATITUDE,
        longitude: DEFAULT_LONGITUDE,
      },
    };
    const snap = functionsTest.firestore.makeDocumentSnapshot(
      requestObj,
      `requests/${REQUEST_ID}`,
    );
    // Calling wrapped function with fake snap and context
    const result = await requestCreated(snap, context);
    expect(result).to.be.null;
  });

  it('Exits if none of the found users have browser notifications enabled', async () => {
    // TODO: Switch to a Geopoint once it is supported for Firebase testing
    // const requestObj = { generalLocation: new admin.firestore.GeoPoint(0, 0) };
    const requestObj = {
      preciseLocation: {
        latitude: 43.074586,
        longitude: DEFAULT_LONGITUDE,
      },
    };
    const snap = functionsTest.firestore.makeDocumentSnapshot(
      requestObj,
      `requests/${REQUEST_ID}`,
    );
    const userId = 'DBC123';
    const userObject = {
      d: {
        displayName: 'asdf',
        generalLocation: {
          latitude: DEFAULT_LATITUDE,
          longitude: DEFAULT_LONGITUDE,
        },
      },
      g: 'dp84p4x9e9',
      l: {
        latitude: DEFAULT_LATITUDE,
        longitude: DEFAULT_LONGITUDE,
      },
    };
    await adminApp.firestore().doc(`users_public/${userId}`).set(userObject);
    // TODO: Switch to this when geopoint is supported in emulator
    // const userObject = {
    //   displayName: 'asdf',
    //   generalLocation: new admin.firestore.GeoPoint(
    //     DEFAULT_LATITUDE,
    //     DEFAULT_LONGITUDE,
    //   ),
    // };
    // const geofirestore = new GeoFirestore(adminApp.firestore());
    // await geofirestore
    //   .collection('users_public')
    //   .doc('ABC123')
    //   .set(userObject, { customKey: 'generalLocation' });
    // console.log('After user create', usersPublic);
    // Calling wrapped function with fake snap and context
    const result = await requestCreated(snap, context);
    expect(result).to.be.null;
    // Listen for new messages until timeout is hit
    // Load data to confirm user has been deleted
  });

  // Skipped since Firestore Emulator doesn't currently support Geopoints
  it('sends message to users within range with browserNotifications: true', async () => {
    // TODO: Switch to a Geopoint once it is supported for Firebase testing
    // const requestObj = { generalLocation: new admin.firestore.GeoPoint(0, 0) };
    const requestObj = {
      preciseLocation: {
        latitude: 43.074586,
        longitude: DEFAULT_LONGITUDE,
      },
    };
    const snap = functionsTest.firestore.makeDocumentSnapshot(
      requestObj,
      `requests/${REQUEST_ID}`,
    );
    const userId = 'DBC123';
    const userObject = {
      d: {
        displayName: 'asdf',
        generalLocation: {
          latitude: DEFAULT_LATITUDE,
          longitude: DEFAULT_LONGITUDE,
        },
      },
      g: 'dp84p4x9e9',
      l: {
        latitude: DEFAULT_LATITUDE,
        longitude: DEFAULT_LONGITUDE,
      },
    };
    await adminApp.firestore().doc(`users_public/${userId}`).set(userObject);
    await adminApp
      .firestore()
      .doc(`users/${userId}`)
      .set({ browserNotifications: true });

    // TODO: Switch to this when geopoint is supported in emulator
    // const userObject = {
    //   displayName: 'asdf',
    //   generalLocation: new admin.firestore.GeoPoint(
    //     DEFAULT_LATITUDE,
    //     DEFAULT_LONGITUDE,
    //   ),
    // };
    // const geofirestore = new GeoFirestore(adminApp.firestore());
    // await geofirestore
    //   .collection('users_public')
    //   .doc('ABC123')
    //   .set(userObject, { customKey: 'generalLocation' });
    // console.log('After user create', usersPublic);
    // Create fake topic and subscription in Pubsub
    await createTopic();
    await createSubscription();
    // Setup subscription to confirm pubsub message is correct
    const topic = pubSubClient.topic(topicName).subscription(subscriptionName);
    const messageHandler = (pubsubMessage) => {
      const message = JSON.parse(pubsubMessage.data.toString());
      expect(message).to.have.property('userId', userId);
      expect(message).to.have.property('message', 'Request Created');
      // Detach message subscriber
      topic.off('message', messageHandler);
    };
    topic.on('message', messageHandler);
    // Trigger function with fake request data and context (expectations in message handler)
    await requestCreated(snap, context);
  });

  // Skipped since Firestore Emulator doesn't currently support Geopoints
  it.only('sends emails to users with role "super-admin"', async () => {
    // TODO: Switch to a Geopoint once it is supported for Firebase testing
    // const requestObj = { generalLocation: new admin.firestore.GeoPoint(0, 0) };
    const requestObj = {
      preciseLocation: {
        latitude: 43.074586,
        longitude: DEFAULT_LONGITUDE,
      },
    };
    const snap = functionsTest.firestore.makeDocumentSnapshot(
      requestObj,
      `requests/${REQUEST_ID}`,
    );
    const userId = 'DBC123';
    const userObject = {
      d: {
        displayName: 'asdf',
        generalLocation: {
          latitude: DEFAULT_LATITUDE,
          longitude: DEFAULT_LONGITUDE,
        },
      },
      g: 'dp84p4x9e9',
      l: {
        latitude: DEFAULT_LATITUDE,
        longitude: DEFAULT_LONGITUDE,
      },
    };
    await adminApp.firestore().doc(`users_public/${userId}`).set(userObject);
    await adminApp
      .firestore()
      .doc(`users/${userId}`)
      .set({ role: 'super-admin' });

    // TODO: Switch to this when geopoint is supported in emulator
    // const userObject = {
    //   displayName: 'asdf',
    //   generalLocation: new admin.firestore.GeoPoint(
    //     DEFAULT_LATITUDE,
    //     DEFAULT_LONGITUDE,
    //   ),
    // };
    // const geofirestore = new GeoFirestore(adminApp.firestore());
    // await geofirestore
    //   .collection('users_public')
    //   .doc('ABC123')
    //   .set(userObject, { customKey: 'generalLocation' });
    // console.log('After user create', usersPublic);
    // Create fake topic and subscription in Pubsub
    // Trigger function with fake request data and context (expectations in message handler)
    await requestCreated(snap, context);

    const mailSnaps = await adminApp.firestore().collection('mail').get();
    const mailDocs = mailSnaps.docs.map((mailDoc) => ({
      id: mailDoc.id,
      ...mailDoc.data(),
    }));
    const [firstMailDoc] = mailDocs;
    expect(firstMailDoc).to.have.nested.property(
      'template.name',
      'new-request',
    );
    expect(firstMailDoc).to.have.nested.property(
      'template.data.projectDomain',
      `${process.env.GCLOUD_PROJECT}.web.app`,
    );
    expect(firstMailDoc).to.have.nested.property(
      'template.data.requestData.id',
      REQUEST_ID,
    );
  });
});
