import * as path from "path";
import * as fs from "fs";

import RequestStats from "../models/RequestStats/RequestStats.model";

import { RLN, IProof } from "semaphore-lib";
import { RedirectMessage, RedirectVerificationStatus } from "../utils/types";

import { getHostFromUrl } from "../utils/utils";
import BannedUser from "../models/BannedUser/BannedUser.model";

import MerkleTreeController from "./MerkleTreeController";
import { MerkleTreeRoot } from "../models/MerkleTree/MerkleTree.model";
import MessageController from "./MessageController";

class RLNController {
  spamThreshold: number = 1;
  merkleTreeController: MerkleTreeController;
  messageController: MessageController;
  verifierKey: any;

  constructor(
    treeController: MerkleTreeController,
    msgController: MessageController
  ) {
    this.merkleTreeController = treeController;
    this.messageController = msgController;
    RLN.setHasher("poseidon");

    const keyPath = path.join("./circuitFiles/rln", "verification_key.json");

    this.verifierKey = JSON.parse(fs.readFileSync(keyPath, "utf-8"));
  }

  public genSignalHash = (signal: string): string => {
    return RLN.genSignalHash(signal).toString();
  };

  public removeUser = async (message: RedirectMessage) => {
    const requestStats = await RequestStats.getSharesForEpochForUser(
      getHostFromUrl(message.url),
      message.epoch,
      message.nullifier
    );

    const sharesX = requestStats.map((stats) => BigInt(stats.xShare));
    const sharesY = requestStats.map((stats) => BigInt(stats.xShare));

    // sharesX.push(RLN.genSignalHash(message.url));
    // sharesY.push(BigInt(message.yShare));

    // const pKey = NRLN.retrievePrivateKey(sharesX, shares Y);
    const pKey = RLN.retrievePrivateKey(
      sharesX[0],
      RLN.genSignalHash(message.url),
      sharesY[0],
      BigInt(message.yShare)
    );

    // const idCommitment = NRLN.genIdentityCommitment([pKey]).toString(); // generate identity commitment from private key
    const idCommitment = RLN.genIdentityCommitment(pKey).toString(); // generate identity commitment from private key

    const leafIndex = await this.merkleTreeController.banUser(
      message.groupId,
      idCommitment
    );

    // for accounting/metadata purposes
    const bannedUser = new BannedUser({
      idCommitment,
      leafIndex,
      secret: pKey.toString(),
    });

    bannedUser.save();
  };

  public verifyRlnProof = async (
    redirectMessage: RedirectMessage
  ): Promise<RedirectVerificationStatus> => {
    if (
      await this.messageController.isDuplicate(
        redirectMessage,
        this.genSignalHash(redirectMessage.url)
      )
    )
      return RedirectVerificationStatus.DUPLICATE;

    const latestRoot = await MerkleTreeRoot.getLatest();
    if (!latestRoot) return RedirectVerificationStatus.INVALID;

    const proof: IProof = {
      proof: redirectMessage.proof,
      publicSignals: [
        BigInt(redirectMessage.yShare),
        BigInt(latestRoot.hash),
        BigInt(redirectMessage.nullifier),
        RLN.genSignalHash(redirectMessage.url),
        redirectMessage.epoch,
        BigInt(redirectMessage.rlnIdentifier),
      ],
    };

    const status = await RLN.verifyProof(this.verifierKey, proof);

    if (!status) {
      return RedirectVerificationStatus.INVALID;
    }

    if (
      await this.messageController.isSpam(redirectMessage, this.spamThreshold)
    ) {
      return RedirectVerificationStatus.SPAM;
    }

    return RedirectVerificationStatus.VALID;
  };
}

export default RLNController;
