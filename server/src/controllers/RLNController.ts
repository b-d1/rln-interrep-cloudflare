import * as path from "path";
import * as fs from "fs";

import RequestStats from "../models/RequestStats/RequestStats.model";

import { NRLN, IProof } from "semaphore-lib";
import { RedirectMessage, RedirectVerificationStatus } from "../utils/types";

import { getHostFromUrl } from "../utils/utils";
import BannedUser from "../models/BannedUser/BannedUser.model";

import MerkleTreeController from "./MerkleTreeController";
import MessageController from "./MessageController";

import poseidonHash from "../utils/hasher";
import { MerkleTreeNode } from "../models/MerkleTree/MerkleTree.model";

class RLNController {
  spamThreshold: number = 3;
  merkleTreeController: MerkleTreeController;
  messageController: MessageController;
  verifierKey: any;

  constructor(
    treeController: MerkleTreeController,
    msgController: MessageController
  ) {
    this.merkleTreeController = treeController;
    this.messageController = msgController;
    NRLN.setHasher("poseidon");

    const keyPath = path.join("./circuitFiles/rln", "verification_key.json");

    this.verifierKey = JSON.parse(fs.readFileSync(keyPath, "utf-8"));
  }

  public genSignalHash = (signal: string): string => {
    return NRLN.genSignalHash(signal).toString();
  };

  public removeUser = async (message: RedirectMessage) => {
    const requestStats = await RequestStats.getSharesForEpochForUser(
      getHostFromUrl(message.url),
      message.epoch,
      message.nullifier
    );

    const sharesX = requestStats.map((stats) => BigInt(stats.xShare));
    const sharesY = requestStats.map((stats) => BigInt(stats.yShare));

      sharesX.push(NRLN.genSignalHash(message.url));
      sharesY.push(BigInt(message.yShare));

    const pKey = NRLN.retrievePrivateKey(sharesX, sharesY);


    const idCommitment = poseidonHash([pKey]).toString();

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

    const root = await MerkleTreeNode.findRoot();
    if (!root) return RedirectVerificationStatus.INVALID;

    const proof: IProof = {
      proof: redirectMessage.proof,
      publicSignals: [
        BigInt(redirectMessage.yShare),
        BigInt(root.hash),
        BigInt(redirectMessage.nullifier),
        NRLN.genSignalHash(redirectMessage.url),
        redirectMessage.epoch
      ],
    };

    const status = await NRLN.verifyProof(this.verifierKey, proof);

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
