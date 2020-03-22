const routes = require("express").Router();
const { validate, Joi } = require("express-validation");
const { GeoFirestore } = require("geofirestore");

const { db, admin } = require("../util/admin");
const { authenticate } = require("../util/auth");

// Create a GeoFirestore reference
const geofirestore = new GeoFirestore(db);

// Create a GeoCollection reference
const geocollection = geofirestore.collection("needs");

const needValidation = {
  body: Joi.object({
    subjects: Joi.array().items(Joi.string()),
    urgency: Joi.number().required(),
    title: Joi.string().required(),
    coordinates: Joi.object().keys({
      _latitude: Joi.number()
        .greater(-90)
        .less(90),
      _longitude: Joi.number()
        .greater(-180)
        .less(180)
    }),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    details: Joi.string().allow("")
  })
};

routes.get("/", authenticate, async (req, res) => {
  let { location, distance, units } = req.query;

  if (!units) {
    units = "mi";
  }

  if (units === "mi") {
    distance = distance * 1.6;
  }

  // Create a GeoQuery based on a location
  const query = geocollection.near({
    center: new admin.firestore.GeoPoint(
      parseFloat(location.split(",")[0]),
      parseFloat(location.split(",")[1])
    ),
    radius: parseFloat(distance)
  });

  try {
    // Get query (as Promise)
    const value = await query.get();
    // All GeoDocument returned by GeoQuery, like the GeoDocument added above
    console.log(value.docs);

    const nearNeeds = value.docs.map(doc => ({ ...doc.data(), ...doc }));
    return res.status(200).send(nearNeeds);
  } catch (err) {
    console.log(err);
    return res.status(500).end();
  }
});

routes.post("/", authenticate, validate(needValidation), async (req, res) => {
  let loc = req.body.location || null;
  if (loc) {
    loc = new admin.firestore.GeoPoint(loc._latitude, loc._longitude);
  }

  const newNeed = {
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    subjects: req.body.subjects,
    urgency: req.body.urgency,
    title: req.body.title,
    coordinates: loc,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    details: req.body.details
  };

  try {
    // Add a GeoDocument to a GeoCollection
    await geocollection.add(newNeed);
    return res.status(200).end();
  } catch (err) {
    console.log(err);
    return res.status(500).end();
  }
});

module.exports = routes;
