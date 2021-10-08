import { model } from "mongoose";
import BannedUserSchema from "./BannedUser.schema";
import { IBannedUserDocument, IBannedUserModel } from "./BannedUser.types";

const MODEL_NAME = "User";

const BannedUser: IBannedUserModel = model<
  IBannedUserDocument,
  IBannedUserModel
>(MODEL_NAME, BannedUserSchema, "bannedUsers");

export default BannedUser;
