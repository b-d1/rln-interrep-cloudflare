import * as path from "path";
import axios from "axios";
import { RLN } from "semaphore-lib";
import { RedirectMessage } from "./types";

const PROVER_KEY_PATH: string = path.join("./circuitFiles", "rln_final.zkey");
const CIRCUIT_PATH: string = path.join("./circuitFiles", "rln.wasm");

const RATE_LIMITING_SERVER_BASE_URL = "http://localhost:8080";
const INTERREP_API_BASE_URL = "http://localhost:8084";

const registerToInterRep = async (idCommitment: BigInt) => {
  const result = await axios.post(`${INTERREP_API_BASE_URL}/register`, {
    identity: idCommitment.toString(),
  });
  return result.data;
};

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

  const res = await axios.post(
    `${RATE_LIMITING_SERVER_BASE_URL}/users/access`,
    request
  );

  return res.data;
};

export { registerToInterRep, visitApp };
