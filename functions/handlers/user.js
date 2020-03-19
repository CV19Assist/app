const { db, admin } = require('../util/admin');
const routes = require("express").Router();
const { validate, Joi } = require("express-validation");
const { authenticate } = require("../util/auth");

const userProfileValidation = {
  body: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    displayName: Joi.string().required(),
    email: Joi.string()
      .email()
      .required(),
    street1: Joi.string(),
    street2: Joi.string(),
    city: Joi.string(),
    state: Joi.string(),
    zip: Joi.string(),
    phone: Joi.string().required(),
    location: Joi.object().keys({
      _latitude: Joi.number().greater(-90).less(90),
      _longitude: Joi.number().greater(-180).less(180),
    })
  })
};

// Create or update a new user profile.
// TODO: Maybe break this into multiple endpoints?
routes.post(
  "/profile",
  authenticate,
  validate(userProfileValidation),
  async (req, res) => {
    let loc = req.body.location || null;
    if (loc) {
      loc = new admin.firestore.GeoPoint(loc._latitude, loc._longitude);
    }
    const newProfile = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      displayName: req.body.displayName,
      email: req.body.email,
      street1: req.body.street1 || null,
      street2: req.body.street2 || null,
      city: req.body.city || null,
      state: req.body.state || null,
      zip: req.body.zip || null,
      phone: req.body.phone,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      location: loc
    };

    try {
      await db.collection("userProfiles").doc(req.user.uid).set(newProfile);
      return res.status(200).end();
    }
    catch(err) {
      console.log(err);
      return res.status(500).end();
    }
  }
);

// Get the user profile.
routes.get("/profile", authenticate, async (req, res) => {
  try {
    const profile = await db.collection("userProfiles").doc(req.user.uid).get();
    if (!profile.exists) {
      return res.status(404).json({error: `profile with id '${req.user.uid}' not found`});
    }
    return res.status(200).json(profile.data());
  }
  catch(err) {
    console.log(err);
    return res.status(500).end();
  }
});

module.exports = routes;