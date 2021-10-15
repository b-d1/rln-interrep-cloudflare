import { Model, Document } from "mongoose";
import {getTotalBannedUsers} from "./BannedUser.statics"

export interface IBannedUser {
  idCommitment: string;
  secret: string;
}

export interface IBannedUserDocument extends IBannedUser, Document {}

export interface IBannedUserModel extends Model<IBannedUserDocument> {
  getTotalBannedUsers: typeof getTotalBannedUsers;
}
