const functions = require("firebase-functions");
const express = require("express");
const v1routes = express.Router();
const { ValidationError } = require("express-validation");
const bodyParser = require("body-parser");
const cors = require("cors");

const userProfileRoutes = require('./handlers/user');
const needsRoutes = require('./handlers/needs');

const { authenticate } = require("./util/auth");

const app = express();
app.use(bodyParser.json());

var whitelist = ['http://localhost:3000', 'https://cv19assist-dev.web.app', 'https://app.cv19assist.com'];
var corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      console.log(origin);
      return callback(new Error('Cross-Origin Resource Sharing (CORS) for this origin is not allowed.'));
    }
  }
}
app.use(cors(corsOptions));

// TODO: Add a new middelware to validate the Environment header.

app.get("/echo", (req, res) => {
  return res.json({ working: "yes", at: new Date().toUTCString() });
});
app.get("/auth-echo", authenticate, (req, res) => {
  return res.json({
    currentUser: req.user,
    working: "yes", at: new Date().toUTCString()
  });
});

v1routes.use("/user", userProfileRoutes);
v1routes.use("/needs", needsRoutes);

app.use("/v1", v1routes);

 
// Special handling for express-validation errors.
// NOTE: This must be the last middleware!
app.use((err, req, res, next) => {
  console.log(err);
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json(err);
  }
  return res.status(500).json({number: err.number, name: err.name, message: err.message});
});

exports.api = functions.https.onRequest(app);