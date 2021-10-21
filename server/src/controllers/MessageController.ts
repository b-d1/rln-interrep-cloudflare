import RequestStats from "../models/RequestStats/RequestStats.model";

import { RedirectMessage } from "../utils/types";

import { getHostFromUrl } from "../utils/utils";

class MessageController {
  public registerValidMessage = async (
    message: RedirectMessage,
    signalHash: string
  ) => {
    const requestStats = new RequestStats({
      appHost: getHostFromUrl(message.url),
      epoch: message.epoch,
      nullifier: message.nullifier,
      xShare: signalHash,
      yShare: message.yShare,
      rlnIdentifier: message.rlnIdentifier
    });

    await requestStats.save();
  };

  public isDuplicate = async (
    redirectMessage: RedirectMessage,
    signalHash: string
  ): Promise<boolean> => {
    return await RequestStats.isDuplicateRequest(
      redirectMessage.rlnIdentifier,
      redirectMessage.epoch,
      redirectMessage.nullifier,
      signalHash,
      redirectMessage.yShare
    );
  };

  /**
   * Function called after the duplicate message check and proof verification.
   */
  public isSpam = async (
    redirectMessage: RedirectMessage,
    spamThreshold: number
  ): Promise<boolean> => {
    return await RequestStats.isSpamRequest(
      redirectMessage.rlnIdentifier,
      redirectMessage.epoch,
      redirectMessage.nullifier,
      spamThreshold
    );
  };
}

export default MessageController;
