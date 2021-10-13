import * as path from "path";
import fs from "fs";
import { RLN } from "semaphore-lib";
import { RedirectMessage } from "./types";
import { accessApp } from "./requests";
const PROVER_KEY_PATH: string = path.join("./circuitFiles", "rln_final.zkey");
const CIRCUIT_PATH: string = path.join("./circuitFiles", "rln.wasm");
const ID_PATH: string = path.join("./id", "id.json")

RLN.setHasher("poseidon");


interface Identity {
  secret: bigint | string,
  idCommitment: bigint | string,
}

/**
 * Read identity from filesystem, if it doesn't exists generate new one
 */
const getIdentity = (): Identity => {

  let idData: Identity= {
    secret: BigInt(0),
    idCommitment: BigInt(0)
  };
  try {
    idData = JSON.parse(fs.readFileSync(ID_PATH, {encoding:'utf-8'}));
  } catch(e) {

    const identity = RLN.genIdentity();
    const identitySecret: bigint = RLN.calculateIdentitySecret(identity);
    const identityCommitment: bigint = RLN.genIdentityCommitment(identitySecret);

    idData = {
      secret: identitySecret.toString(),
      idCommitment: identityCommitment.toString()
    }
    fs.writeFileSync(ID_PATH, JSON.stringify(idData));
  }
  idData.secret = BigInt(idData.secret)
  idData.idCommitment = BigInt(idData.idCommitment)
  return idData;

}

const visitApp = async (
  identitySecret: bigint,
  witness: any,
  rlnIdentifier: bigint,
  interRepGroup: string,
  epoch: string,
  url: string
) => {
  epoch = RLN.genExternalNullifier(epoch);
  const fullProof = await RLN.genProofFromBuiltTree(
    identitySecret,
    witness,
    epoch,
    url,
    rlnIdentifier,
    CIRCUIT_PATH,
    PROVER_KEY_PATH
  );

  const xShare: bigint = RLN.genSignalHash(url);

  const a1 = RLN.calculateA1(identitySecret, epoch, rlnIdentifier);
  const y = RLN.calculateY(a1, identitySecret, xShare);
  const nullifier = RLN.genNullifier(a1, rlnIdentifier);

  const request: RedirectMessage = {
    proof: fullProof.proof,
    nullifier: nullifier.toString(),
    url,
    epoch,
    yShare: y.toString(),
    groupId: interRepGroup,
    rlnIdentifier: rlnIdentifier.toString(),
  };

  return await accessApp(request);
};

export { getIdentity, visitApp, Identity };
