import RequestStats from "./RequestStats.model";
import { IRequestStats, IShares } from "./RequestStats.types";
import { getHostFromUrl } from "../../utils/utils";

export async function getByEpochAndSharesForUser(
  this: typeof RequestStats,
  host: string,
  epoch: string,
  nullifier: string,
  xShare: string,
  yShare: string
): Promise<IRequestStats | null> {
  return this.findOne({
    "app.host": host,
    "epochs.epoch": epoch,
    "epochs.nullifierStats.nullifier": nullifier,
    "epochs.nullifierStats.shares.xShare": xShare,
    "epochs.nullifierStats.shares.yShare": yShare,
  });
}

export async function getSharesForEpochForUser(
  this: typeof RequestStats,
  host: string,
  epoch: string,
  nullifier: string
): Promise<IShares[]> {
  const res = await this.findOne(
    {
      "app.host": host,
      "epochs.epoch": epoch,
      "epochs.nullifierStats.nullifier": nullifier,
    },
    { "epochs.nullifierStats.shares": 1 }
  );

  if (!res) return [];

  return res.epochs[0].nullifierStats[0].shares;
}

export async function getByEpoch(
  this: typeof RequestStats,
  host: string,
  epoch: string
): Promise<IRequestStats | null> {
  return this.findOne({ "app.host": host, "epochs.epoch": epoch });
}

export async function findByApp(
  this: typeof RequestStats,
  url: string
): Promise<IRequestStats | null> {
  const host = getHostFromUrl(url);

  return this.findOne({ "app.host": host });
}

export async function isDuplicateRequest(
  this: typeof RequestStats,
  host: string,
  epoch: string,
  nullifier: string,
  xShare: string,
  yShare: string
): Promise<boolean> {
  const request = await this.findOne({
    "epochs.epoch": epoch,
    "epochs.nullifierStats.nullifier": nullifier,
    "epochs.nullifierStats.shares.xShare": xShare,
    "epochs.nullifierStats.shares.yShare": yShare,
    "app.host": host,
  });
  return request ? true : false;
}

export async function isSpamRequest(
  this: typeof RequestStats,
  host: string,
  epoch: string,
  nullifier: string,
  numRequests: number
): Promise<boolean> {
  const request = await this.findOne({
    "epochs.epoch": epoch,
    "epochs.nullifierStats.nullifier": nullifier,
    "epochs.nullifierStats.numRequests": { $gte: numRequests },
    "app.host": host,
  });

  return request ? true : false;
}
