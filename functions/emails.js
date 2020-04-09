// Email functions
const functions = require("firebase-functions");
const { db } = require("./util/admin");

const config = functions.config();
const adminEmails = config.admin.emails;

exports.sendNewUserCreatedEmail = functions.auth.user().onCreate(user => {
    db.collection('mail').add({
      to: adminEmails,
      message: {
        subject: `New user authenticated - ${user.email}`,
        text: `New user was authenticated: ${user.uid} - ${user.displayName}`
      }
    });
});