const firebaseConfig = require('../util/config');
const firebase = require("firebase");

firebase.initializeApp(firebaseConfig);
module.exports = { firebase };