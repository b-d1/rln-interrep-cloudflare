import { Schema } from "mongoose";
import {
  isDuplicateRequest,
  isSpamRequest,
  getSharesForEpochForUser,
} from "./RequestStats.statics";
import {
  IRequestStats,
  IRequestStatsModel,
  IRequestStatsDocument,
} from "./RequestStats.types";

const RequestStatsSchemaField: Record<keyof IRequestStats, any> = {
  appHost: String,
  nullifier: String,
  epoch: String,
  xShare: String,
  yShare: String,
  rlnIdentifier: String
};

const RequestStatsSchema = new Schema<
  IRequestStatsDocument,
  IRequestStatsModel
>(RequestStatsSchemaField);

RequestStatsSchema.statics.isDuplicateRequest = isDuplicateRequest;
RequestStatsSchema.statics.isSpamRequest = isSpamRequest;
RequestStatsSchema.statics.getSharesForEpochForUser = getSharesForEpochForUser;

export default RequestStatsSchema;
