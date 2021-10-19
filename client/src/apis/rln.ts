import * as path from "path";
import { NRLN } from "semaphore-lib";
import { RedirectMessage } from "../utils/types";
import * as bigintConversion from "bigint-conversion";
import { accessApp } from "../utils/requests"
const PROVER_KEY_PATH: string = path.join("./circuitFiles", "rln_final.zkey");
const CIRCUIT_PATH: string = path.join("./circuitFiles", "rln.wasm");

const SPAM_THRESHOLD = 3;

const getEpoch = () => {
  // For PoC purposes only, in real life apps the epoch will be obtained
  // in a deterministic manner and the client and the server will be synchronised.
  return "test-epoch";
};

const generateRequest = async (
  identitySecret: bigint[],
  witness: any,
  rlnIdentifier: bigint,
  interRepGroup: string,
  epoch: string,
  url: string
): Promise<RedirectMessage> => {
  epoch = NRLN.genExternalNullifier(epoch);
  const fullProof = await NRLN.genProofFromBuiltTree(
    identitySecret,
    witness,
    epoch,
    url,
    CIRCUIT_PATH,
    PROVER_KEY_PATH
  );

  const xShare: bigint = NRLN.genSignalHash(url);

  const [y, nullifier] = NRLN.calculateOutput(
    identitySecret,
    bigintConversion.hexToBigint(epoch.slice(2)),
    xShare,
    SPAM_THRESHOLD
  );

  const request: RedirectMessage = {
    proof: fullProof.proof,
    nullifier: nullifier.toString(),
    url,
    epoch,
    yShare: y.toString(),
    groupId: interRepGroup,
    rlnIdentifier: rlnIdentifier.toString(),
  };
  return request;

};

export { generateRequest, getEpoch };
