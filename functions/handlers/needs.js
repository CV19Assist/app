const routes = require("express").Router();
const { validate, Joi } = require("express-validation");
const { GeoFirestore } = require("geofirestore");

const { db, admin } = require("../util/admin");
const { authenticate, getUserProfileSummary, checkIfUserLoggedIn } = require("../util/auth");

// Create a GeoFirestore reference
const geofirestore = new GeoFirestore(db);
const needsGeocollection = geofirestore.collection("needs");

const needValidation = {
  body: Joi.object({
    needs: Joi.array().min(1).items(Joi.string()),
    immediacy: Joi.number().greater(0).less(11).required(),
    // shortDescription: Joi.string().required(),
    contactInfo: Joi.string().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    otherDetails: Joi.string().allow(""),
    coordinates: Joi.object().required().keys({
      _latitude: Joi.number()
        .greater(-90)
        .less(90),
      _longitude: Joi.number()
        .greater(-180)
        .less(180)
    }),
  })
};

routes.post("/new", checkIfUserLoggedIn, validate(needValidation), async (req, res) => {
  let loc = req.body.coordinates || null;
  if (loc) {
    loc = new admin.firestore.GeoPoint(loc._latitude, loc._longitude);
  }

  const newNeed = {
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    needs: req.body.needs,
    immediacy: req.body.immediacy,
    // shortDescription: req.body.shortDescription,
    contactInfo: req.body.contactInfo,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    otherDetails: req.body.otherDetails,
    coordinates: loc,
    status: 1,
  };

  let userSummary = null;
  if (req.user) {
    userSummary = await getUserProfileSummary(req.user.uid);
    newNeed.createdBy = userSummary;
  }

  try {
    // Add a GeoDocument to a GeoCollection
    const newDoc = await needsGeocollection.add(newNeed);
    let historyEntry = {
      action: 1, takenAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (userSummary) {
      historyEntry = {...historyEntry, ...userSummary}
    }

    newDoc['_document'].collection("history").add(historyEntry);
    return res.status(200).json({id: newDoc.id});
  } catch (err) {
    console.log(err);
    return res.status(500).end();
  }
});


// ====== Assignment
const assignmentParams = {
  body: Joi.object({
    id: Joi.string().required(),
  })
};

routes.post("/assign", authenticate, validate(assignmentParams), async (req, res) => {
  // Find the document and ensure that it's not already assigned.
  let needDocRef = needsGeocollection.doc(req.body.id);
  let needDoc;
  try {
    needDoc = await needDocRef.get();
    if (!needDoc.exists) {
      return resp.status(404).json(err);
    }
  } catch(err) {
    console.log(err);
    return resp.status(500).json(err);
  }

  needData = needDoc.data();
  // console.log(needData);
  if (needData.owner) {
    if (needData.owner.userProfileId === req.user.uid) {
      return res.status(403).json({message:"This is already assigned to you."});
    }

    return res.status(403).json({message:"Sorry, someone already took this."});
  }

  // Otherwise assign to the current user.
  const userSummary = await getUserProfileSummary(req.user.uid);
  try {
    await needDocRef.update({
      status: 10,   // Assigned
      lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      owner: {
        ...userSummary,
        takenAt: admin.firestore.FieldValue.serverTimestamp()
      }
    });

    const historyEntry = {
      action: 5,  // Took ownership
      takenAt: admin.firestore.FieldValue.serverTimestamp(),
      ...userSummary
    };
    needDocRef['_document'].collection("history").add(historyEntry);
  }
  catch(err) {
    console.log(err);
    return res.status(500).json(err);
  }

  return res.status(200).end();
});


// ====== Searching
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
    distance = distance * 1.609344;
  }

  // Limit the distance for now.
  if (distance > 161) {   // 161 km ~ 100 miles
    return res.status(400).json({error: "Sorry, the max distance is currently limited to 100 miles."})
  }

  // Create a GeoQuery based on a location
  const query = needsGeocollection
    .near({
      center: new admin.firestore.GeoPoint(parseFloat(lat), parseFloat(lng)),
      radius: parseFloat(distance)
    })
    .where("status", "==", 1)
    .limit(50);

  try {
    // Get query (as Promise)
    const value = await query.get();
    // All GeoDocument returned by GeoQuery, like the GeoDocument added above
    // console.log(value.docs);

    // Limit for now.
    let message = "";
    let docs = value.docs;
    if (docs.length > 50) {
      docs = docs.slice(0, 50);
      message = "Search limited to the first 50 results.";
    }

    const results = value.docs.map(doc => {
      const mapped = { ...doc.data(), ...doc };
      
      // // Remove the contact info and coordinates from the search results.
      // delete mapped.coordinates;
      // delete mapped.contactInfo;

      return mapped;
    });
    return res.status(200).json({results: results, message: message});
  } catch (err) {
    console.log(err);
    return res.status(500).end();
  }
});


// Returns the needs (or tasks) for the current user.
routes.get("/my-tasks", authenticate, async (req, res) => {
  const query = needsGeocollection
    .where("owner.userProfileId", "==", req.user.uid)
    .where("status", "==", 10);

  let qs;
  try {
    qs = await query.get();
  } catch(err) {
    console.log(err);
    return res.status(500).end();
  }

  const results = qs.docs.map(doc => ({ ...doc.data(), ...doc }));
  return res.status(200).json(results);
});


// ======= Get a specific Need
routes.get("/:id", checkIfUserLoggedIn, async (req, res) => {
  const id = req.params.id;
  let docRef;
  try {
    docRef = await needsGeocollection.doc(id).get();
    if (!docRef.exists) {
      return res.status(404).json({error: `could not find need with id '${id}'`});
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }

  let docData = docRef.data();

  // // Delete contact and other private info if not the owner.
  // console.log(req.user);
  // console.log(docData.owner);
  // if (
  //   !req.user ||
  //   !docData.owner ||
  //   req.user.uid !== docData.owner.userProfileId
  // ) {
  //   delete docData.coordinates;
  //   delete docData.contactInfo;
  // }

  return res.status(200).json(docData);
});


// ========== Release
// Release the given need
routes.post("/:id/release", authenticate, async (req, res) => {
  // Find the document and ensure that it's not already assigned.
  let needDocRef = needsGeocollection.doc(req.params.id);
  let needDoc;
  try {
    needDoc = await needDocRef.get();
    if (!needDoc.exists) {
      return res.status(404).json({error: `could not find need with id '${req.params.id}'`});
    }
  } catch(err) {
    console.log(err);
    return res.status(500).json(err);
  }

  needData = needDoc.data();

  // Confirm that the user was actually assigned.
  if (!needData.owner) {
    return res.status(403).json({message:"No one is assigned to this need, please assign someone first."});
  }

  if (needData.owner.userProfileId !== req.user.uid) {
    return res.status(403).json({message:"Sorry, this need is not assigned to you."});
  }

  // Finally, release the need.
  const userSummary = await getUserProfileSummary(req.user.uid);
  try {
    await needDocRef.update({
      status: 1,   // New
      lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      owner: null
    });

    const historyEntry = {
      action: 10,  // Took ownership
      takenAt: admin.firestore.FieldValue.serverTimestamp(),
      ...userSummary
    };
    needDocRef['_document'].collection("history").add(historyEntry);
  }
  catch(err) {
    console.log(err);
    return res.status(500).json(err);
  }

  return res.status(200).end();
});

// // ========== Need contact info
// // Returns the contact info for the given need.
// routes.post("/:id/contact-info", authenticate, async (req, res) => {
//   // Find the document and ensure that it's not already assigned.
//   let needDocRef = needsGeocollection.doc(req.params.id);
//   let needDoc;
//   try {
//     needDoc = await needDocRef.get();
//     if (!needDoc.exists) {
//       return res.status(404).json({error: `could not find need with id '${req.params.id}'`});
//     }
//   } catch(err) {
//     console.log(err);
//     return res.status(500).json(err);
//   }

//   needData = needDoc.data();

//   // Confirm that the user was actually assigned.
//   if (!needData.owner) {
//     return res.status(403).json({message:"No one is assigned to this need, please assign someone first."});
//   }

//   if (needData.owner.userProfileId !== req.user.uid) {
//     return res.status(403).json({message:"Sorry, this need is not assigned to you."});
//   }

//   if (needData.status === 20) {
//     return res.status(403).json({message:"This need was already fulfilled."});
//   }

//   // Finally, complete the need.
//   const userSummary = await getUserProfileSummary(req.user.uid);
//   try {
//     await needDocRef.update({
//       status: 20,   // Completed
//       lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
//     });

//     const historyEntry = {
//       action: 20,  // Completed
//       takenAt: admin.firestore.FieldValue.serverTimestamp(),
//       ...userSummary
//     };
//     needDocRef['_document'].collection("history").add(historyEntry);
//   }
//   catch(err) {
//     console.log(err);
//     return res.status(500).json(err);
//   }

//   return res.status(200).end();
// });

// ========== Complete
// Complete the given need
routes.post("/:id/complete", authenticate, async (req, res) => {
  // Find the document and ensure that it's not already assigned.
  let needDocRef = needsGeocollection.doc(req.params.id);
  let needDoc;
  try {
    needDoc = await needDocRef.get();
    if (!needDoc.exists) {
      return res.status(404).json({error: `could not find need with id '${req.params.id}'`});
    }
  } catch(err) {
    console.log(err);
    return res.status(500).json(err);
  }

  needData = needDoc.data();

  // Confirm that the user was actually assigned.
  if (!needData.owner) {
    return res.status(403).json({message:"No one is assigned to this need, please assign someone first."});
  }

  if (needData.owner.userProfileId !== req.user.uid) {
    return res.status(403).json({message:"Sorry, this need is not assigned to you."});
  }

  if (needData.status === 20) {
    return res.status(403).json({message:"This need was already fulfilled."});
  }

  // Finally, complete the need.
  const userSummary = await getUserProfileSummary(req.user.uid);
  try {
    await needDocRef.update({
      status: 20,   // Completed
      lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const historyEntry = {
      action: 20,  // Completed
      takenAt: admin.firestore.FieldValue.serverTimestamp(),
      ...userSummary
    };
    needDocRef['_document'].collection("history").add(historyEntry);
  }
  catch(err) {
    console.log(err);
    return res.status(500).json(err);
  }

  return res.status(200).end();
});


module.exports = routes;