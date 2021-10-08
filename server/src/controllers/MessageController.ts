import RequestStats from "../models/RequestStats/RequestStats.model";
import {
  IEpochStats,
  INullifierStats,
} from "../models/RequestStats/RequestStats.types";

import { RedirectMessage } from "../utils/types";

import { getHostFromUrl } from "../utils/utils";

class MessageController {
  public registerValidMessage = async (
    message: RedirectMessage,
    signalHash: string
  ) => {
    const requestStats = await RequestStats.findOne({
      "app.host": getHostFromUrl(message.url),
    });

    if (!requestStats) return;

    let epochObj: IEpochStats | undefined = requestStats.epochs.find(
      (epoch) => epoch.epoch === message.epoch
    );
    const isEpoch = epochObj ? true : false;
    if (!epochObj) {
      epochObj = {
        epoch: message.epoch,
        nullifierStats: [],
      };
    }

    let nullifierObj: INullifierStats | undefined =
      epochObj.nullifierStats.find(
        (nullifier) => nullifier.nullifier === message.nullifier
      );
    const isNullifier = nullifierObj ? true : false;

    if (!nullifierObj) {
      nullifierObj = {
        nullifier: message.nullifier,
        numRequests: 0,
        shares: [],
      };
    }

    nullifierObj.numRequests += 1;
    nullifierObj.shares.push({
      xShare: signalHash,
      yShare: message.yShare,
    });

    if (!isNullifier) epochObj.nullifierStats.push(nullifierObj);
    if (!isEpoch) requestStats.epochs.push(epochObj);

    await requestStats.save();
  };

  public isDuplicate = async (
    redirectMessage: RedirectMessage,
    signalHash: string
  ): Promise<boolean> => {
    return await RequestStats.isDuplicateRequest(
      getHostFromUrl(redirectMessage.url),
      redirectMessage.epoch,
      redirectMessage.nullifier,
      signalHash,
      redirectMessage.yShare
    );
  };

  public isSpam = async (
    redirectMessage: RedirectMessage,
    spamThreshold: number
  ): Promise<boolean> => {
    /**
     * Function called after the duplicate message check and proof verification.
     * We just need to check if there are more shares than the `SPAM_THRESHOLD` sent by the user in the same epoch, if yes then we can
     * consider this as a spam, because the message was not duplicate and also the proof was valid.
     */

    // TODO: perform this as a Mongodb query (expose a statics function)
    return await RequestStats.isSpamRequest(
      getHostFromUrl(redirectMessage.url),
      redirectMessage.epoch,
      redirectMessage.nullifier,
      spamThreshold
    );
  };
}

export default MessageController;
