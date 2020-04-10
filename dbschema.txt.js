
// Additional concepts being defined.
//  - Privileged users - Admins, volunteer helpers, and other "privileged" users.
//  - Privileged Data - Data that can be seen by privileged users.
//  - Semi-private data - Data that can be seen by any volunteer, but requires auditing.
//  - Private data - Data that is not intended for public consumption.


firebase.users = {
  // Additional roles.  Need to better understand how to accomplish this with standard firebase
  // features.
  //   - Admin
}

userProfiles = [
  {
    d: {
      firstName: Joi.string().required(),
      displayName: Joi.string().required(),

      // For privacy, randomly adjusted version of the privateData.preciseLocation.
      generalLocation: Joi.object().keys({
        _latitude: Joi.number().greater(-90).less(90),
        _longitude: Joi.number().greater(-180).less(180)
      }),

      privilegedData: Collection(
        {
          lastName: Joi.string().required(),
          email: Joi.string()
            .email()
            .required(),
          address1: Joi.string().allow(""),
          address2: Joi.string().allow(""),
          city: Joi.string().allow(""),
          state: Joi.string().allow(""),
          zipcode: Joi.string().allow(""),
          phone: Joi.string().required(),
        }
      ),

      privateData: Collection(
        {
          preciseLocation: Joi.object().keys({
            _latitude: Joi.number().greater(-90).less(90),
            _longitude: Joi.number().greater(-180).less(180)
          }),
        }
      )
    }
  }
];

needs = [
  {
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

      createdAt: timestamp,

      // Optional.  this is set if a user created it.
      createdBy: { userProfileId, firstName, displayName },

      // For privacy, randomly adjusted version of the semiPrivateData.preciseLocation.
      generalLocation: Joi.object().keys({
        _latitude: Joi.number().greater(-90).less(90),
        _longitude: Joi.number().greater(-180).less(180)
      }),

      owner: {
        userProfileId,
        firstName,
        displayName,
        takenAt
      },

      // Public comments about the request, e.g. if a volunteer reaches out to the
      // requestor and has additional details to add.
      comments: Collection(
        {
          author: {userProfileId, firstName, displayName},
          createdAt: firestore.Timestamp,
          comment: Joi.string().required(),
        }
      ),

      // Private discussion about this specific request between the requestor, volunteer and
      // other privileged users. This will only be displayed to the requestor, volunteer and
      // privileged users (e.g., admins).
      privateDiscussion: Collection(
        {
          author: {userProfileId, firstName, displayName},
          
          // Type of the private discussion.
          //   1 - discussion
          //   5 - acceptance comment
          //   8 - admin comment
          //  10 - completion comment
          type: Joi.number().required(),

          createdAt: firestore.Timestamp,
          text: Joi.string().required(),
        }
      ),

      // Assignments.  Sub-collection, currently only visible to admins.  No functionatity needed in the UI.
      history: Collection(
        {
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
        }
      ),

      // This data can be shared with any volunteers, but we will first require an entry in the
      // `history` subcollection for tracking.
      semiPrivateData: Collection(
        {
          phoneNumber: Joi.string().required(),
          email: Joi.string().required(),
        }
      ),

      // This data should only be accessible by privileged data (e.g, admins or other future
      // privileged users).
      privilegedData: Collection(
        {
          lastName: Joi.string().required(),
          preciseLocation: Joi.object().keys({
            _latitude: Joi.number().greater(-90).less(90),
            _longitude: Joi.number().greater(-180).less(180)
          })
        },
      ),
    }
  }
];


aggregates = {
  unfulfilledNeedsInfo: [
    {
      id: "",
      createdAt: "",
      immediacy: "",
      needs: ["", ""],

      // The general location.
      location: Joi.object().keys({
        _latitude: Joi.number()
          .greater(-90)
          .less(90),
        _longitude: Joi.number()
          .greater(-180)
          .less(180)
      }),
    }, ...
  ]
};