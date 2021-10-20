import config from "../config";
import { generateRequest } from "../apis/rln";
import {  waitForConnection, initState, getState } from "../apis/socket";
import { ZkIdentity } from "@libsem/identity";
import { registerToInterRep, accessApp } from "../utils/requests";
import { sleep } from "../utils/utils";
import { exit } from "process";


const rlnIdentifier = config.RLN_IDENTIFIER;
const epoch = "test-epoch";

const main = async () => {
  const identitySecret: bigint[] = ZkIdentity.genRandomSecret(config.SPAM_TRESHOLD);
  const identityCommitment: BigInt = ZkIdentity.genIdentityCommitmentFromSecret(identitySecret);

  initState(config.INTERREP_GROUPS[0], identityCommitment.toString());

  // Register to interrep
  console.log("registerring to interrep...");
  await registerToInterRep(config.INTERREP_GROUPS[0], identityCommitment.toString());

  // wait 15 seconds for the rln server to fetch the registration
  await sleep(config.REGISTER_WAIT_SECONDS);


  // get witness from the rate limiting service
  const witness = getState().witness;

  // Visit app

  // request 1 (ok)
  let request = await generateRequest(
    identitySecret,
    witness,
    rlnIdentifier,
    config.INTERREP_GROUPS[0],
    epoch,
    `${config.APP_BASE_URL}/hello`
  );
  let result = await accessApp(request);
  console.log(result);
  // request 2 (ok)
  request = await generateRequest(
    identitySecret,
    witness,
    rlnIdentifier,
    config.INTERREP_GROUPS[0],
    epoch,
    `${config.APP_BASE_URL}/hi`
  );
  result = await accessApp(request);
  console.log(result);

  // request 3 (ok)
  request = await generateRequest(
    identitySecret,
    witness,
    rlnIdentifier,
    config.INTERREP_GROUPS[0],
    epoch,
    `${config.APP_BASE_URL}/hi1`
  );
  result = await accessApp(request);
  console.log(result);

  // request 4 (duplicate)
  request = await generateRequest(
    identitySecret,
    witness,
    rlnIdentifier,
    config.INTERREP_GROUPS[0],
    epoch,
    `${config.APP_BASE_URL}/hello`
  );
  result = await accessApp(request);
  console.log(result);

  // request 5 (spam)
  request = await generateRequest(
    identitySecret,
    witness,
    rlnIdentifier,
    config.INTERREP_GROUPS[0],
    epoch,
    `${config.APP_BASE_URL}/hi2`
  );
  result = await accessApp(request);
  console.log(result);

  // request 6 (request should be flagged early as duplicate)
  request = await generateRequest(
    identitySecret,
    witness,
    rlnIdentifier,
    config.INTERREP_GROUPS[0],
    epoch,
    `${config.APP_BASE_URL}/hello`
  );
  result = await accessApp(request);
  console.log(result);

  // request 7 (request should be invalid - the idCommitment is removed from the tree)
  request = await generateRequest(
    identitySecret,
    witness,
    rlnIdentifier,
    config.INTERREP_GROUPS[0],
    epoch,
    `${config.APP_BASE_URL}/hi3`
  );
  result = await accessApp(request);
  console.log(result);

  exit(0);
};

waitForConnection().then(() => main());
