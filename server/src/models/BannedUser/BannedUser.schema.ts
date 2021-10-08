import { Schema } from "mongoose";
import {
  IBannedUser,
  IBannedUserDocument,
  IBannedUserModel,
} from "./BannedUser.types";

const BannedUserSchemaField: Record<keyof IBannedUser, any> = {
  idCommitment: { type: String, required: true, unique: true },
  leafIndex: { type: Number, required: true, unique: true },
  secret: { type: Number, default: false },
};

const UserSchema = new Schema<IBannedUserDocument, IBannedUserModel>(
  BannedUserSchemaField
);

export default UserSchema;
