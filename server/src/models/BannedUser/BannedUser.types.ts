import { Model, Document } from "mongoose";

export interface IBannedUser {
  idCommitment: string;
  leafIndex: number;
  secret: string;
}

export interface IBannedUserDocument extends IBannedUser, Document {}

export interface IBannedUserModel extends Model<IBannedUserDocument> {}
