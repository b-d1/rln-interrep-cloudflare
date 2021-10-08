import { model } from "mongoose";
import ReqeustStatsSchema from "./RequestStats.schema";
import {
  IRequestStatsDocument,
  IRequestStatsModel,
} from "./RequestStats.types";

const MODEL_NAME = "RequestStats";

const RequestStats: IRequestStatsModel = model<
  IRequestStatsDocument,
  IRequestStatsModel
>(MODEL_NAME, ReqeustStatsSchema, "requestStats");

export default RequestStats;
