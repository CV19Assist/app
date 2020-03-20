const functions = require("firebase-functions");
const express = require("express");
const bodyParser = require("body-parser");
const userProfileRoutes = require('./handlers/user');
const { ValidationError } = require("express-validation");
const { authenticate } = require("./util/auth");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());

var whitelist = ['http://localhost:3000', 'https://cv19assist-dev.web.app'];
var corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  }
}
app.use(cors(corsOptions));

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