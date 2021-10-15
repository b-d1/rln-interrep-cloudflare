import { Schema } from "mongoose";
import {getTotalBannedUsers} from "./BannedUser.statics"
import {
  IBannedUser,
  IBannedUserDocument,
  IBannedUserModel,
} from "./BannedUser.types";

const BannedUserSchemaFields: Record<keyof IBannedUser, any> = {
  idCommitment: { type: String, required: true, unique: true },
  secret: { type: Number, default: false },
};

const UserSchema = new Schema<IBannedUserDocument, IBannedUserModel>(
  BannedUserSchemaFields
);

UserSchema.statics.getTotalBannedUsers = getTotalBannedUsers

export default UserSchema;
