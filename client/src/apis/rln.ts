import * as path from "path";
import { NRln, genExternalNullifier, genSignalHash, FullProof } from "@libsem/protocols";

import config from "../config";
import { RedirectMessage } from "../utils/types";
const PROVER_KEY_PATH: string = path.join("./circuitFiles", "rln_final.zkey");
const CIRCUIT_PATH: string = path.join("./circuitFiles", "rln.wasm");

const getSignal = (): string => {
  return Math.random().toString();
};

const getEpoch = (url: string) => {
  // The epoch is generated from the request url and a timestamp, determined in a known way for the client and the server
  //
  const timestamp = "1234";
  return `${url}--${timestamp}`;
};

const generateRequest = async (
  identitySecret: bigint[],
  witness: any,
  rlnIdentifier: bigint,
  interRepGroup: string,
  url: string
): Promise<RedirectMessage> => {
  let epoch = getEpoch(url);
  epoch = genExternalNullifier(epoch);
  const signal = getSignal();
  const signalHash = genSignalHash(signal);

  const proofInput = {
    identity_secret: identitySecret,
    path_elements: witness.pathElements,
    identity_path_index: witness.indices,
    epoch,
    x: signalHash,
    rln_identifier: rlnIdentifier
  };

  const proofWitness: FullProof = NRln.genWitness(identitySecret, witness, epoch, signal, rlnIdentifier)

  const fullProof: FullProof = await NRln.genProof(proofWitness, CIRCUIT_PATH, PROVER_KEY_PATH)

  const [y, nullifier] = NRln.calculateOutput(
    identitySecret,
    BigInt(epoch),
    signalHash,
    config.SPAM_TRESHOLD,
    rlnIdentifier
  );

  const request: RedirectMessage = {
    proof: fullProof.proof,
    nullifier: nullifier.toString(),
    url,
    signal,
    epoch,
    yShare: y.toString(),
    groupId: interRepGroup,
    rlnIdentifier: rlnIdentifier.toString(),
  };
  return request;
};

export { generateRequest, getEpoch };
