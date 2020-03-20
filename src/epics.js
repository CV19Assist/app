import { combineEpics } from "redux-observable";
import { userCheckEpic, logoutEpic, saveUserProfileEpic } from "./modules/user";

export const rootEpic = combineEpics(
  // Authentication
  userCheckEpic,
  logoutEpic,
  saveUserProfileEpic,
);
