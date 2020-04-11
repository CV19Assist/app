
// Additional concepts being defined.
//  - Privileged users - Admins, volunteer helpers, and other "privileged" users.
//  - Privileged Data - Data that can be seen by privileged users.
//  - Semi-private data - Data that can be seen by any volunteer, but requires auditing.
//  - Private data - Data that is not intended for public consumption.


// ==================================== User Profiles ====================================

// Additional roles.  Need to better understand how to accomplish this with standard firebase
// features.
//   - Admin

userProfiles = [{
  d: {
    firstName: Joi.string().required(),
    displayName: Joi.string().required(),

    // TODO: Add rule to ensure that this isn't set inappropriately.
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

// This collection will have one user profile for each user so the records are keyed by the auth
// uid, just like userProfiles.
userProfilesPrivilegedData = [{
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


// This collection will have one user profile for each user so the records are keyed by the auth
// uid, just like userProfiles.
userProfilesPrivateData = [{
  role: Joi.string().required(),
  preciseLocation: Joi.object().keys({
    _latitude: Joi.number().greater(-90).less(90),
    _longitude: Joi.number().greater(-180).less(180)
  }),
}];

// ==================================== Needs ====================================
needs = [{
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

    // Optional.  this is set if a user created it.
    createdBy: { userProfileId, firstName, displayName },

    // For privacy, randomly adjusted version of the preciseLocation. This must be called
    // "coordinates" for the geofirestore library to work.
    coordinates: Joi.object().keys({
      _latitude: Joi.number().greater(-90).less(90),
      _longitude: Joi.number().greater(-180).less(180)
    }),

    // A city-level designation of the general location.
    generalLocationName: Joi.string().required(),

    owner: { userProfileId, firstName, displayName, takenAt },
  }
}];

// Need actions. Only visible to admins.  No functionatity needed in the UI for now.
needsActions = [{
  needId: Joi.string().required(),
  action: Joi.number().required(),
  // Possible options:
  //   1-created
  //   2-viewed-contact-information
  //   5-took-ownership
  //   7-started
  //   10-released
  //   15-assigned -- for future functionality.
  //   20-completed

  takenAt, // When the action was taken.
  userProfileId,
  firstName,
  lastName,
  displayName,

  // if 15-assigned
  assignedBy
}];

// This data can be shared with any volunteers, but we will first require an entry in the `history`
// subcollection for tracking.
needsSemiPrivateData = [{
  phoneNumber: Joi.string().required(),
  email: Joi.string().required(),
}]

// This data should only be accessible by privileged data (e.g, admins or other future
// privileged users).
// This collection will have one record for each need so the records are keyed by the need
// id, just like `needs` collection.
needsPrivateData = {
  needId: {
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    preciseLocation: Joi.object().keys({
      _latitude: Joi.number().greater(-90).less(90),
      _longitude: Joi.number().greater(-180).less(180)
    })
  }
};

// Private discussion about this specific request between the requestor, volunteer and
// other privileged users. This will only be displayed to the requestor, volunteer and
// privileged users (e.g., admins).
needsPrivateDiscussions = [{
    needId: Joi.string().required(),
    author: {userProfileId, firstName, displayName},
    
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
needsPublicComments = [{
  needId: Joi.string().required(),
  author: {userProfileId, firstName, displayName},
  createdAt: firestore.Timestamp,
  content: Joi.string().required(),
  contentType: Joi.string().required()   // Will be forced to 'text' for now.  Maybe later on we can support formatted content.
}];


// ==================================== Aggregates ====================================
// Used for aggregated data that might be displayed across the UI.
aggregates = {

  // Unfulfilled needs displayed on the homepage.
  unfulfilledNeedsInfo: [
    {
      needId: "",
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