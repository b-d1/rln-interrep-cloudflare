import * as path from "path";
import axios from "axios";
import { NRLN } from "semaphore-lib";
import { RedirectMessage } from "./types";
import * as bigintConversion from 'bigint-conversion';

const PROVER_KEY_PATH: string = path.join("./circuitFiles", "rln_final.zkey");
const CIRCUIT_PATH: string = path.join("./circuitFiles", "rln.wasm");

const RATE_LIMITING_SERVER_BASE_URL = "http://localhost:8080";
const INTERREP_API_BASE_URL = "http://localhost:8084";

const SPAM_THRESHOLD = 3;

const registerToInterRep = async (idCommitment: BigInt) => {
  const result = await axios.post(`${INTERREP_API_BASE_URL}/register`, {
    identity: idCommitment.toString(),
  });
  return result.data;
};

const getWitness = async (groupId: string, idCommitment: BigInt) => {
  const result = await axios.get(`${RATE_LIMITING_SERVER_BASE_URL}/users/witness/${groupId}/${idCommitment.toString()}`);
  return result.data.data;
};



const visitApp = async (
  identitySecret: bigint[],
  witness: any,
  rlnIdentifier: bigint,
  interRepGroup: string,
  epoch: string,
  url: string
) => {
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

  const [y, nullifier] = NRLN.calculateOutput(identitySecret, bigintConversion.hexToBigint(epoch.slice(2)), xShare, SPAM_THRESHOLD);


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

export { registerToInterRep, visitApp, getWitness };
