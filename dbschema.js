import { submitForAssignmentEpic } from "./src/modules/needs";

userProfiles = [
  {
    d: {
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      displayName: Joi.string().required(),
      email: Joi.string()
        .email()
        .required(),
      address1: Joi.string().allow(""),
      address2: Joi.string().allow(""),
      city: Joi.string().allow(""),
      state: Joi.string().allow(""),
      zipcode: Joi.string().allow(""),
      phone: Joi.string().required(),
      coordinates: Joi.object().keys({
        _latitude: Joi.number()
          .greater(-90)
          .less(90),
        _longitude: Joi.number()
          .greater(-180)
          .less(180)
      })
    }
  }
];

needs = [
  {
    d: {
      needs: Joi.array().items(Joi.string()),
      immediacy: Joi.number()
        .greater(0)
        .less(11)
        .required(),
        // 1 - not urgent
        // 5 - not very urgent
        // 10 - urgent

    
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

      // Switching to 1-new-or-released to simplify logic.
      status: "1-new-or-released 5-released 10-assigned 20-completed",

      createdAt,

      // Optional.  this is set if a user created it.
      createdBy: { userProfileId, firstName, displayName },

      owner: {
        userProfileId,
        firstName,
        displayName,
        takenAt
      },

      // Assignments.  Sub-collection.
      history: Collection(
        {
          action: "1",
            // 1-created
            // 5-took-ownership
            // 10-released
            // 15-assigned -- for future functionality.
            // 20-completed

          takenAt, // When the action was taken.
          userProfileId,
          firstName,
          lastName,
          displayName,

          // if 15-assigned
          assignedBy
        }
      )
    }
  }
];
