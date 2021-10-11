import RequestStats from "./RequestStats.model";
import { IRequestStats, IShares } from "./RequestStats.types";
import { getHostFromUrl } from "../../utils/utils";

export async function getSharesForEpochForUser(
  this: typeof RequestStats,
  host: string,
  epoch: string,
  nullifier: string
): Promise<IShares[]> {
  return this.find(
    {
      appHost: host,
      epoch,
      nullifier,
    },
    { xShare: 1, yShare: 1 }
  );
}

export async function getByEpoch(
  this: typeof RequestStats,
  host: string,
  epoch: string
): Promise<IRequestStats[]> {
  return this.find({ appHost: host, epoch });
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
    appHost: host,
    epoch,
    nullifier,
    xShare,
    yShare,
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
  const requests = await this.aggregate([
    {
      $match: {
        appHost: host,
        epoch,
        nullifier,
      },
    },
    {
      $count: "num_requests",
    },
  ]);

  return requests.length === 1 && requests[0].num_requests >= numRequests;
}
