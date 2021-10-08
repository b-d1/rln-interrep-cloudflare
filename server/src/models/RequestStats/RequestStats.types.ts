import { Model, Document } from "mongoose";
import {
  isDuplicateRequest,
  isSpamRequest,
  getSharesForEpochForUser,
} from "./RequestStats.statics";
import { IApp } from "../App/App.types";

export interface IShares {
  xShare: string;
  yShare: string;
}

export interface INullifierStats {
  nullifier: string;
  numRequests: number;
  shares: IShares[];
}

export interface IEpochStats {
  epoch: string;
  nullifierStats: INullifierStats[];
}

export interface IRequestStats {
  app: IApp;
  epochs: IEpochStats[];
}

export interface IRequestStatsDocument extends IRequestStats, Document {}

export interface IRequestStatsModel extends Model<IRequestStatsDocument> {
  isDuplicateRequest: typeof isDuplicateRequest;
  isSpamRequest: typeof isSpamRequest;
  getSharesForEpochForUser: typeof getSharesForEpochForUser;
}
