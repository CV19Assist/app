import { combineEpics } from "redux-observable";
import { userCheckEpic, logoutEpic } from "./modules/auth";

export const rootEpic = combineEpics(
  // Authentication
  userCheckEpic,
  logoutEpic,
);
