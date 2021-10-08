import { Schema } from "mongoose";
import {
  isDuplicateRequest,
  isSpamRequest,
  getSharesForEpochForUser,
} from "./RequestStats.statics";
import AppSchema from "../App/App.schema";
import {
  IRequestStats,
  IRequestStatsModel,
  IRequestStatsDocument,
} from "./RequestStats.types";

const RequestStatsSchemaField: Record<keyof IRequestStats, any> = {
  app: AppSchema,
  epochs: [
    {
      epoch: String,
      nullifierStats: [
        {
          nullifier: String,
          numRequests: Number,
          shares: [
            {
              xShare: String,
              yShare: String,
            },
          ],
        },
      ],
    },
  ],
};

const RequestStatsSchema = new Schema<
  IRequestStatsDocument,
  IRequestStatsModel
>(RequestStatsSchemaField);

RequestStatsSchema.statics.isDuplicateRequest = isDuplicateRequest;
RequestStatsSchema.statics.isSpamRequest = isSpamRequest;
RequestStatsSchema.statics.getSharesForEpochForUser = getSharesForEpochForUser;

export default RequestStatsSchema;
