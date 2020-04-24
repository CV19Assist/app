#!/usr/bin/env node
/* eslint-disable no-console */
const admin = require('firebase-admin');

async function convertRequests() {
  const needsRef = admin.firestore().collection('needs');
  let needsSnap;
  try {
    needsSnap = await needsRef.get();
  } catch (err) {
    console.log(`Error loading needs from firestore: ${err.message}`);
    throw err;
  }
  try {
    // Create a single batch for all needs updates
    const batch = admin.firestore().batch();
    needsSnap.docs.forEach((needSnap) => {
      const privateRequest = {
        createdAt: needSnap.get('d.createdAt'),
        firstName: needSnap.get('d.firstName') || null,
        lastName: needSnap.get('d.lastName') || null,
        needs: needSnap.get('d.needs'),
        preciseLocation: needSnap.get('d.coordinates'),
        immediacy: parseInt(needSnap.get('d.immediacy'), 10),
      };
      if (needSnap.get('d.createdBy.userProfileId')) {
        privateRequest.createdBy = needSnap.get('d.createdBy.userProfileId');
        privateRequest.createdByInfo = {
          firstName: needSnap.get('d.createdBy.firstName'),
          displayName: needSnap.get('d.createdBy.displayName'),
          uid: needSnap.get('d.createdBy.userProfileId'),
        };
      }

      batch.set(
        admin.firestore().doc(`requests/${needSnap.id}`),
        privateRequest,
        {
          merge: true,
        },
      );

      const publicRequest = {
        ...needSnap.data(),
        d: {
          ...needSnap.get('d'),
          immediacy: parseInt(needSnap.get('d.immediacy'), 10),
        },
      };
      if (needSnap.get('d.owner.userProfileId')) {
        publicRequest.owner = needSnap.get('d.owner.userProfileId');
        publicRequest.ownerInfo = {
          uid: needSnap.get('d.owner.userProfileId'),
          firstName: needSnap.get('d.owner.firstName'),
          displayName: needSnap.get('d.owner.displayName'),
        };
      }
      if (needSnap.get('d.createdBy.userProfileId')) {
        publicRequest.createdBy = privateRequest.createdBy;
        publicRequest.createdByInfo = privateRequest.createdByInfo;
      }
      batch.set(
        admin.firestore().doc(`requests_public/${needSnap.id}`),
        publicRequest,
        { merge: true },
      );

      const requestContact = {
        email: needSnap.get('d.email') || null,
        phone: needSnap.get('d.phone') || null,
        contactInfo: needSnap.get('d.contactInfo') || null, // Old contact info.
      };
      batch.set(
        admin.firestore().doc(`requests_contact/${needSnap.id}`),
        requestContact,
        { merge: true },
      );
    });
    await batch.commit();
    console.log(
      'Successfully converted needs -> requests, copying needs/$needId/history...',
    );

    // Copy needs/$needId/history -> requests/$requestId/actions
    // Batch copy of all actions for a single need
    await Promise.all(
      needsSnap.docs.map(async (needSnap) => {
        const needActionsRef = admin
          .firestore()
          .collection(`needs/${needSnap.id}/history`);
        const actionsBatch = admin.firestore().batch();
        const needActionsSnap = await needActionsRef.get();
        needActionsSnap.forEach((needActionSnap) => {
          actionsBatch.set(
            admin.firestore().doc(`requests_actions/${needSnap.id}/actions`),
            needActionSnap,
          );
        });
        await actionsBatch.commit();
      }),
    );
    console.log(
      'Successfully copied needs/$needId/history -> requests/$requestId/actions',
    );
  } catch (err) {
    console.log(`Error converting needs -> requests: ${err.message}`);
    throw err;
  }
}

async function convertUsers() {
  const userProfilesRef = admin.firestore().collection('userProfiles');
  let profilesSnap;
  try {
    profilesSnap = await userProfilesRef.get();
  } catch (err) {
    console.log(`Error loading userProfiles from firestore: ${err.message}`);
    throw err;
  }
  try {
    const batch = admin.firestore().batch();
    profilesSnap.docs.forEach((profileSnap) => {
      const privateUser = {
        firstName: profileSnap.get('d.firstName'),
        displayName: profileSnap.get('d.displayName'),
        lastName: profileSnap.get('d.lastName'),
        preciseLocation: profileSnap.get('d.coordinates'),
      };
      batch.set(admin.firestore().doc(`users/${profileSnap.id}`), privateUser, {
        merge: true,
      });
      const publicUser = {
        d: {
          firstName: profileSnap.get('d.firstName'),
          displayName: profileSnap.get('d.displayName'),
          // TODO: we have to call the scramble location on coordinates because of the current
          // version doesn't have a generalLocationName concept.
          coordinates: profileSnap.get('d.coordinates'),
          // TODO: we have to generate the general location name based on the scrambled location.
          // generalLocationName: profileSnap.get('d.generalLocationName'),
        },
        // TODO: Look into if g/l should be changed to be generalized or if they were already
        g: profileSnap.get('g'),
        l: profileSnap.get('l'),
      };
      batch.set(
        admin.firestore().doc(`users_public/${profileSnap.id}`),
        publicUser,
        {
          merge: true,
        },
      );
      const privilegedUser = {
        firstName: profileSnap.get('d.firstName'),
        lastName: profileSnap.get('d.lastName'),
        displayName: profileSnap.get('d.displayName'),
        email: profileSnap.get('d.email'),
        address1: profileSnap.get('d.address1'),
        address2: profileSnap.get('d.address2'),
        city: profileSnap.get('d.city'),
        state: profileSnap.get('d.state'),
        zipcode: profileSnap.get('d.zipcode') || null,
        phone: profileSnap.get('d.phone'),
      };
      batch.set(
        admin.firestore().doc(`users_privileged/${profileSnap.id}`),
        privilegedUser,
        {
          merge: true,
        },
      );
    });

    await batch.commit();
    console.log('Successfully converted users');
  } catch (err) {
    console.log(`Error converting userProfiles -> users: ${err.message}`);
    throw err;
  }
}

function loadServiceAccount() {
  if (process.env.SERVICE_ACCOUNT) {
    try {
      return JSON.parse(process.env.SERVICE_ACCOUNT);
    } catch (err) {
      console.log(`Error parsing service account env variable: ${err.message}`);
      throw err;
    }
  }
  try {
    return require(`${__dirname}/../serviceAccount.json`); // eslint-disable-line import/no-dynamic-require, global-require
  } catch (err) {
    console.log(`Error loading service account from file: ${err.message}`);
    throw err;
  }
}

async function migrateToNewFormat() {
  const serviceAccount = loadServiceAccount();
  // Init Firebase admin SDK
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
  });
  console.log('Converting to new data format...');
  try {
    // Convert needs -> requests, requests_public, requests_contact
    await convertRequests();
    // Convert userProfiles -> users, users_privileged, users_public
    await convertUsers();
    console.log(`Successfully converted Firestore data to new format`);
  } catch (err) {
    console.log(`Error uploading mail templates: ${err.message}`);
    throw err;
  }
}

(async function runTemplatesUpdate() {
  try {
    // Upload all email templates
    await migrateToNewFormat();
    process.exit(0);
  } catch (err) {
    console.log(`Error uploading mail templates: ${err.message}`);
    process.exit(1);
  }
})();
