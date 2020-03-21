const routes = require("express").Router();
const { validate, Joi } = require("express-validation");
const { db, admin } = require("../util/admin");
const { authenticate } = require("../util/auth");

const needValidation = {
  body: Joi.object({
    subjects: Joi.array().items(Joi.string()),
    urgency: Joi.number().required(),
    title: Joi.string().required(),
    location: Joi.object().keys({
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
    location: loc,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    details: req.body.details
  };

  try {
    await db
      .collection("needs")
      .doc(req.user.uid)
      .set(newNeed);
    return res.status(200).end();
  } catch (err) {
    console.log(err);
    return res.status(500).end();
  }
});

module.exports = routes;