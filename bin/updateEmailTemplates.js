#!/usr/bin/env node

const fs = require('fs');
const admin = require('firebase-admin');

const emailTemplatesDirectoryPath = `${__dirname}/../emailTemplates`;

async function uploadEmailTemplate(fileName) {
  const docId = fileName.split('.')[0];
  const fileContentsBuffer = fs.readFileSync(
    `${emailTemplatesDirectoryPath}/${fileName}`,
  );
  try {
    await admin.firestore().doc(`email_templates/${docId}`).set(
      {
        html: fileContentsBuffer.toString(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  } catch (err) {
    console.log(`Error uploading mail template "${fileName}": ${err.message}`); // eslint-disable-line no-console
    throw err;
  }
}

async function updateTemplates() {
  let serviceAccount;
  try {
    serviceAccount =
      process.env.SERVICE_ACCOUNT ||
      require(`${__dirname}/../serviceAccount.json`); // eslint-disable-line import/no-dynamic-require, global-require
  } catch (err) {
    console.log(`Error loading service account: ${err.message}`); // eslint-disable-line no-console
    process.exit(1);
    throw err;
  }
  // Init Firebase admin SDK
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
  });
  // Read directory to get file paths
  const fileNames = fs.readdirSync(emailTemplatesDirectoryPath);
  console.log('Updating email templates...'); // eslint-disable-line no-console
  try {
    // Update each template in Firestore
    await Promise.all(fileNames.map(uploadEmailTemplate));
    console.log(`Successfully updated ${fileNames.length} email templates`); // eslint-disable-line no-console
  } catch (err) {
    console.log(`Error uploading mail templates: ${err.message}`); // eslint-disable-line no-console
    throw err;
  }
}

(async function runTemplatesUpdate() {
  try {
    // Upload all email templates
    await updateTemplates();
    process.exit(0);
  } catch (err) {
    console.log(`Error uploading mail templates: ${err.message}`); // eslint-disable-line no-console
    process.exit(1);
  }
})();
