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
    });

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

  /**
   * Function called after the duplicate message check and proof verification.
   * We just need to check if there are more shares than the `SPAM_THRESHOLD` sent by the user in the same epoch, if yes then we can
   * consider this as a spam, because the message was not duplicate and also the proof was valid.
   */
  public isSpam = async (
    redirectMessage: RedirectMessage,
    spamThreshold: number
  ): Promise<boolean> => {
    return await RequestStats.isSpamRequest(
      getHostFromUrl(redirectMessage.url),
      redirectMessage.epoch,
      redirectMessage.nullifier,
      spamThreshold
    );
  };
}

export default MessageController;
