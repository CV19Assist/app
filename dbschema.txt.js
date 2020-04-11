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

    // TODO: figure out how to add a rule to ensure that this isn't set inappropriately.
    role: Joi.string().required(),

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
  
    // 4/10/2020: Deprecated in favor of semiPrivateData.phoneNumber & email.
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
    createdBy: { uid, firstName, displayName },

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

    owner: { uid, firstName, displayName, takenAt },
  }
}];

// This data can be shared with any volunteers, but we will first require an entry in the
// requests_public.usersWithContactInfoAccess collection.
requestsContactInfo = [{
  phoneNumber: Joi.string().required(),
  email: Joi.string().required(),
}];

// Request actions. Only visible to admins.  No functionatity needed in the UI for now.
requestsActions = [{
  requestId: Joi.string().required(),
  action: Joi.number().required(),
  // Possible options:
  //   1-created
  //   2-viewed-contact-information
  //   5-took-ownership
  //   7-started
  //   10-released
  //   15-assigned -- for future functionality.
  //   20-completed

  createdAt, // When the action was taken.
  uid,
  firstName,
  lastName,
  displayName,

  // if 15-assigned
  assignedBy
}];

// Private discussion about this specific request between the requestor, volunteer and
// other privileged users. This will only be displayed to the requestor, volunteer and
// privileged users (e.g., admins).
requestsDiscussions = [{
    requestId: Joi.string().required(),
    author: {uid, firstName, displayName},
    
    // Type of the private discussion.
    //   1 - discussion
    //   5 - acceptance comment
    //   8 - admin comment
    //  10 - completion comment
    type: Joi.number().required(),

    createdAt: firestore.Timestamp,
    text: Joi.string().required(),
}];

// Public comments about the request, e.g. if a volunteer reaches out to the requestor and has
// additional details to add.
requestsComments = [{
  requestId: Joi.string().required(),
  author: {uid, firstName, displayName},
  createdAt: firestore.Timestamp,
  content: Joi.string().required(),
  contentType: Joi.string().required()   // Will be forced to 'text' for now.  Maybe later on we can support formatted content.
}];


// ==================================== Aggregates ====================================
// Used for aggregated data that might be displayed across the UI.
aggregates = {
  // Unfulfilled requestId displayed on the homepage.
  unfulfilledRequestsInfo: [
    {
      requestId: "",
      createdAt: "",
      immediacy: "",
      needs: ["", ""],

      // The general location.
      location: Joi.object().keys({
        _latitude: Joi.number().greater(-90).less(90),
        _longitude: Joi.number().greater(-180).less(180)
      }),
    }
  ]
};