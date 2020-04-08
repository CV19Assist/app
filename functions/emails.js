// Email functions
const functions = require("firebase-functions");
const { db } = require("./util/admin");

const adminEmails = ['farhan@cv19assist.com', 'saad@cv19assist.com'];

exports.sendNewNeedCreatedEmail = functions.firestore
  .document('needs/{needId}').onCreate((need, context) => {
    const needData = need.data();
    db.collection('mail').add({
      to: adminEmails,
      message: {
        subject: `New request created - ${needData.d.firstName}`,
        text: `New request was created: ${need.id}`
      }
    });
  });


exports.sendNewUserCreatedEmail = functions.auth.user().onCreate(user => {
    db.collection('mail').add({
      to: adminEmails,
      message: {
        subject: `New user authenticated - ${user.email}`,
        text: `New user was authenticated: ${user.uid} - ${user.displayName}`
      }
    });
});