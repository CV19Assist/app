import { combineEpics } from "redux-observable";
import { userCheckEpic, logoutEpic, saveUserProfileEpic } from "./modules/user";
import { loadSearchEpic, } from "./modules/needsSearch";
import {
  submitForAssignmentEpic,
  submitNeedEpic,
  loadNeedDetailsEpic,
  releaseNeedAssignmentEpic,
  completeNeedAssignmentEpic,
  loadMyTasksEpic
} from "./modules/needs";

export const rootEpic = combineEpics(
  // Authentication
  userCheckEpic,
  logoutEpic,
  saveUserProfileEpic,

  // Needs search
  loadSearchEpic,

  // Needs
  submitNeedEpic,
  submitForAssignmentEpic,
  loadNeedDetailsEpic,
  releaseNeedAssignmentEpic,
  completeNeedAssignmentEpic,
  loadMyTasksEpic,
);
