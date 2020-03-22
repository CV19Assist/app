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
    needs: Joi.array().items(Joi.string()),
    immediacy: Joi.number().greater(0).less(11).required(),
    shortDescription: Joi.string().required(),
    contactInfo: Joi.string().required(),
    name: Joi.string().required(),
    otherDetails: Joi.string().allow(""),
    coordinates: Joi.object().keys({
      _latitude: Joi.number()
        .greater(-90)
        .less(90),
      _longitude: Joi.number()
        .greater(-180)
        .less(180)
    }),
  })
};

routes.post("/new", validate(needValidation), async (req, res) => {
  let loc = req.body.coordinates || null;
  if (loc) {
    loc = new admin.firestore.GeoPoint(loc._latitude, loc._longitude);
  }

  const newNeed = {
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    needs: req.body.needs,
    immediacy: req.body.immediacy,
    shortDescription: req.body.shortDescription,
    contactInfo: req.body.contactInfo,
    name: req.body.name,
    otherDetails: req.body.otherDetails,
    coordinates: loc,
  };

  try {
    // Add a GeoDocument to a GeoCollection
    const newDoc = await geocollection.add(newNeed);
    return res.status(200).json({id: newDoc.id});
  } catch (err) {
    console.log(err);
    return res.status(500).end();
  }
});

const searchParams = {
  query: Joi.object({
    lat: Joi.number()
      .greater(-90)
      .less(90),
    lng: Joi.number()
      .greater(-180)
      .less(180),
    distance: Joi.number().required(),
    units: Joi.string().required().valid("mi", "km")
  })
};

routes.get("/", authenticate, validate(searchParams), async (req, res) => {
  let { lat, lng, distance, units } = req.query;

  if (!units) {
    units = "mi";
  }

  if (units === "mi") {
    distance = distance * 1.6;
  }

  // Create a GeoQuery based on a location
  const query = geocollection.near({
    center: new admin.firestore.GeoPoint(
      parseFloat(lat),
      parseFloat(lng)
    ),
    radius: parseFloat(distance)
  });

  try {
    // Get query (as Promise)
    const value = await query.get();
    // All GeoDocument returned by GeoQuery, like the GeoDocument added above
    // console.log(value.docs);

    const nearNeeds = value.docs.map(doc => {
      const mapped = { ...doc.data(), ...doc };
      
      // Remove the contact info and coordinates from the search results.
      delete mapped.coordinates;
      delete mapped.contactInfo;

      return mapped;
    });
    return res.status(200).send(nearNeeds);
  } catch (err) {
    console.log(err);
    return res.status(500).end();
  }
});


module.exports = routes;
