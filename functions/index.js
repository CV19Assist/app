const functions = require("firebase-functions");
const express = require("express");
const bodyParser = require("body-parser");
const userProfileRoutes = require('./handlers/user');
const { ValidationError } = require("express-validation");
const { authenticate } = require("./util/auth");

const app = express();
app.use(bodyParser.json());

// User profile routes.
app.get("/echo", (req, res) => {
  return res.json({ working: "yes", at: new Date().toUTCString() });
});
app.get("/auth-echo", authenticate, (req, res) => {
  return res.json({
    currentUser: req.user,
    working: "yes", at: new Date().toUTCString()
  });
});
app.use("/user", userProfileRoutes);
 
// Special handling for express-validation errors.
app.use((err, req, res, next) => {
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json(err)
  }
  return res.status(500).json(err);
});

exports.api = functions.https.onRequest(app);