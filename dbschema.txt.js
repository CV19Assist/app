// Additional concepts being defined.
//  - Privileged users - Admins, volunteer helpers, and other "privileged" users.
//  - Privileged Data - Data that can be seen by privileged users.
//  - Semi-private data - Data that can be seen by any volunteer, but requires auditing.
//  - Private data - Data that is not intended for public consumption.

// Additional roles.  Need to better understand how to accomplish this with standard firebase
// features.
//   - Admin

// ==================================== Users ====================================
// This collection will have one document for each user so the records are keyed by the auth
// uid, just like userProfiles.
users = [{
  role: Joi.string().required(),
  preciseLocation: Joi.object().keys({
    _latitude: Joi.number().greater(-90).less(90),
    _longitude: Joi.number().greater(-180).less(180)
  }),
}];

// This collection will have one document for each user so the records are keyed by the auth
// uid, just like userProfiles.
users_privileged = [{
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  displayName: Joi.string().required(),

  email: Joi.string().email().required(),
  address1: Joi.string().allow(""),
  address2: Joi.string().allow(""),
  city: Joi.string().allow(""),
  state: Joi.string().allow(""),
  zipcode: Joi.string().allow(""),
  phone: Joi.string().required()
}];

users_public = [{
  d: {
    firstName: Joi.string().required(),
    displayName: Joi.string().required(),

    // For privacy, randomly adjusted version of the preciseLocation. This must be called
    // "coordinates" for the geofirestore library to work.
    coordinates: Joi.object().keys({
      _latitude: Joi.number().greater(-90).less(90),
      _longitude: Joi.number().greater(-180).less(180)
    }),

    // A city-level designation of the general location. 
    generalLocationName: Joi.string().required(),
  }
}];

// This data should only be accessible by privileged users (e.g, admins or other future
// privileged users).
// This collection will drive the main requests and thus be the main 'request id.'
requests = [{
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  needs: Joi.array().items(Joi.string()),
  createdBy: Joi.string().required(),
  createdAt: firestore.Timestamp,

  // 1 - not urgent
  // 5 - not very urgent
  // 10 - urgent
  immediacy: Joi.number().greater(0).less(11).required(),
  preciseLocation: Joi.object().keys({
    _latitude: Joi.number().greater(-90).less(90),
    _longitude: Joi.number().greater(-180).less(180)
  })
}];

// ==================================== Requests ====================================
requests_public = [{
  d: {
    needs: Joi.array().items(Joi.string()),

    // 1 - not urgent
    // 5 - not very urgent
    // 10 - urgent
    immediacy: Joi.number().greater(0).less(11).required(),
  
    // 4/10/2020: Deprecated in favor of semiPrivateData.phone & email.
    // contactInfo: Joi.string().required(),

    firstName: Joi.string().required(),
    otherDetails: Joi.string().allow(""),

    //  Possible options.
    //    1-new-or-released
    //    5-released --- NOT CURRENTLY USED.
    //    10-assigned
    //    15-in progress
    //    20-completed
    //    30-cannot-achieve - Closed for other reasons, e.g. could not find a volunteer.
    status: Joi.number().required(),

    createdAt: firestore.timestamp,
    lastUpdatedAt: firestore.Timestamp,

    // Optional. This is set if a user created it, and also duplicated in the `requestsActions`
    // collection.
    createdBy: uid,
    createdByInfo: { uid, firstName, displayName },

    // For privacy, randomly adjusted version of the preciseLocation. This must be called
    // "coordinates" for the geofirestore library to work.
    coordinates: Joi.object().keys({
      _latitude: Joi.number().greater(-90).less(90),
      _longitude: Joi.number().greater(-180).less(180)
    }),

    // A city-level designation of the general location.
    generalLocationName: Joi.string().required(),

    // Users that have requested to see the contact info.
    usersWithContactInfoAccess: [ uid ],
    
    // User which takes request
    owner: uid,
    // Info object
    ownerInfo: { firstName, displayName, takenAt },
  }
}];