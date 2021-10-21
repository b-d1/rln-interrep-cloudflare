// import { NRLN, IProof } from "semaphore-lib";
import { NRln, genSignalHash, genExternalNullifier, IProof } from "@libsem/protocols"
import * as path from "path";
import * as fs from "fs";

import config from "../config"

import RequestStats from "../models/RequestStats/RequestStats.model";

import { RedirectMessage, RedirectVerificationStatus } from "../utils/types";

import { getHostFromUrl, getEpoch } from "../utils/utils";
import BannedUser from "../models/BannedUser/BannedUser.model";

import MerkleTreeController from "./MerkleTreeController";
import MessageController from "./MessageController";

import poseidonHash from "../utils/hasher";
import { MerkleTreeNode } from "../models/MerkleTree/MerkleTree.model";

class RLNController {
  merkleTreeController: MerkleTreeController;
  messageController: MessageController;
  verifierKey: any;

  constructor(
    treeController: MerkleTreeController,
    msgController: MessageController
  ) {
    this.merkleTreeController = treeController;
    this.messageController = msgController;

    const keyPath = path.join("./circuitFiles/rln", "verification_key.json");

    this.verifierKey = JSON.parse(fs.readFileSync(keyPath, "utf-8"));
  }

  public verifyRlnProof = async (
    redirectMessage: RedirectMessage
  ): Promise<RedirectVerificationStatus> => {
    if (
      await this.messageController.isDuplicate(
        redirectMessage,
        this.genSignalHashString(redirectMessage.signal)
      )
    )
      return RedirectVerificationStatus.DUPLICATE;

    const root = await MerkleTreeNode.findRoot(redirectMessage.groupId);
    if (!root) return RedirectVerificationStatus.INVALID;

    const proof: IProof = {
      proof: redirectMessage.proof,
      publicSignals: [
        BigInt(redirectMessage.yShare),
        BigInt(root.hash),
        BigInt(redirectMessage.nullifier),
        genSignalHash(redirectMessage.signal),
        redirectMessage.epoch,
        BigInt(redirectMessage.rlnIdentifier)
      ],
    };

    const status = await NRln.verifyProof(this.verifierKey, proof);

    if (!status) {
      return RedirectVerificationStatus.INVALID;
    }

    if (
      await this.messageController.isSpam(redirectMessage, config.SPAM_TRESHOLD)
    ) {
      return RedirectVerificationStatus.SPAM;
    }

    return RedirectVerificationStatus.VALID;
  };

  public verifyEpoch = (redirectMessage: RedirectMessage): boolean => {
    const generatedEpoch = getEpoch(redirectMessage.url);
    return genExternalNullifier(generatedEpoch) === redirectMessage.epoch
  }

  public genSignalHashString = (signal: string): string => {
    return genSignalHash(signal).toString();
  };

  public removeUser = async (message: RedirectMessage): Promise<string> => {
    const requestStats = await RequestStats.getSharesForEpochForUser(
      getHostFromUrl(message.url),
      message.epoch,
      message.nullifier
    );

    const sharesX = requestStats.map((stats) => BigInt(stats.xShare));
    const sharesY = requestStats.map((stats) => BigInt(stats.yShare));

      sharesX.push(genSignalHash(message.signal));
      sharesY.push(BigInt(message.yShare));

    const secret: bigint = NRln.retrieveSecret(sharesX, sharesY);

    const idCommitment = poseidonHash([secret]).toString();

    const treeNode = await MerkleTreeNode.findLeafByGroupIdAndHash(message.groupId, idCommitment);

    if(!treeNode) {
      throw new Error("Invalid user removal, the user doesn't exists");
    }

    // for accounting/metadata purposes
    const bannedUser = new BannedUser({
      idCommitment,
      leafIndex: treeNode.key.index,
      secret: secret.toString(),
    });

    await bannedUser.save();
    return idCommitment
  };


}



export default RLNController;
