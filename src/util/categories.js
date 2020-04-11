
// {key: "food", description: "Food or Grocery Delivery"},
// {key: "housing-utilities", description: "Housing or Utilities"},
// {key: "health-question", description: "Health Questions"},
// {key: "emotional-support", description: "Emotional Support"},
// {key: "other", description: "Other - please add more information in the details section below"},
// {key: "financial-needs", description: "Limited, Immediate Financial Needs"}

// All the supported categories, including the inactived ones.
export const allCategoryMap = {
  "grocery-pickup": {
    active: true,
    shortDescription: "Grocery Pick-up",
    description: "Food, grocery, or prescription pick-up/delivery",
  },
  "emotional-support": {
    active: false,
    shortDescription: "Emotional Support",
    description: "Emotional support"
  },
  food: {
    active: false,
    shortDescription: "Food or Grocery",
    description: "Food or Grocery"
  },
  "financial-needs": {
    active: false,
    shortDescription: "Financial needs",
    description: "Limited financial needs"
  },
  "housing-utilities": {
    active: false,
    shortDescription: "Housing or Utilities",
    description: "Housing or Utilities"
  },
  "health-question": { active: false,
    shortDescription: "Health Questions",
    description: "Health Questions" },
  "other": {
    active: true,
    shortDescription: "Other",
    description: "Other",
    inputCaption: "Other - Please provide details below."
  }
};

// Create only the active categories.
let _categoryMap = {};
Object.keys(allCategoryMap).forEach(key => {
  if (allCategoryMap[key].active) {
    _categoryMap[key] = allCategoryMap[key];
  }
});

// Only the active categories.
export const activeCategoryMap = _categoryMap;