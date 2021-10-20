import { Schema } from "mongoose";
import {getTotalBannedUsers} from "./BannedUser.statics"
import {
  IBannedUser,
  IBannedUserDocument,
  IBannedUserModel,
} from "./BannedUser.types";

const BannedUserSchemaFields: Record<keyof IBannedUser, any> = {
  idCommitment: { type: String, required: true, unique: true },
  leafIndex: {type: Number, required: true, unique: false },
  secret: { type: String, required: true, unique: true },
};

const UserSchema = new Schema<IBannedUserDocument, IBannedUserModel>(
  BannedUserSchemaFields
);

UserSchema.statics.getTotalBannedUsers = getTotalBannedUsers

export default UserSchema;