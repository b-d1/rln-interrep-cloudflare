import config from "../config";
import { generateRequest } from "../apis/rln";
import { waitForConnection, initState, getState } from "../apis/socket";
import { ZkIdentity } from "@libsem/identity";
import { registerToInterRep, accessApp, getRlnIdentifierForApp } from "../utils/requests";
import { sleep } from "../utils/utils";
import { exit } from "process";


const appName = config.APP_NAME;


const main = async () => {

  const rlnIdentifier = await getRlnIdentifierForApp(appName);

  const zkIdentity: ZkIdentity = new ZkIdentity();
  zkIdentity.genRandomSecret(config.SPAM_TRESHOLD);
  const identitySecret: bigint[] = zkIdentity.getSecret();
  const identityCommitment: BigInt = zkIdentity.genIdentityCommitmentFromSecret();

  initState(config.INTERREP_GROUPS[0], identityCommitment.toString());

  // Register to interrep
  console.log("registerring to interrep...");
  await registerToInterRep(
    config.INTERREP_GROUPS[0],
    identityCommitment.toString()
  );

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
    `${config.APP_BASE_URL}/hello`
  );
  let result = await accessApp(request);
  console.log(result);

  // request 2 (ok) - different url
  request = await generateRequest(
    identitySecret,
    witness,
    rlnIdentifier,
    config.INTERREP_GROUPS[0],
    `${config.APP_BASE_URL}/hi`
  );
  result = await accessApp(request);
  console.log(result);

  // request 3 (ok) - different url
  request = await generateRequest(
    identitySecret,
    witness,
    rlnIdentifier,
    config.INTERREP_GROUPS[0],
    `${config.APP_BASE_URL}/hi1`
  );
  result = await accessApp(request);
  console.log(result);

  // request 4 (ok) - same url, second time visit
  request = await generateRequest(
    identitySecret,
    witness,
    rlnIdentifier,
    config.INTERREP_GROUPS[0],
    `${config.APP_BASE_URL}/hello`
  );
  result = await accessApp(request);
  console.log(result);

  // request 5 (ok) - same url, third time visit
  request = await generateRequest(
    identitySecret,
    witness,
    rlnIdentifier,
    config.INTERREP_GROUPS[0],
    `${config.APP_BASE_URL}/hello`
  );
  result = await accessApp(request);
  console.log(result);

  // request6 (spam) - same url, fourth time visit attempt
  request = await generateRequest(
    identitySecret,
    witness,
    rlnIdentifier,
    config.INTERREP_GROUPS[0],
    `${config.APP_BASE_URL}/hello`
  );
  result = await accessApp(request);
  console.log(result);

  // request 7 (invalid) - user removed from merkle tree
  request = await generateRequest(
    identitySecret,
    witness,
    rlnIdentifier,
    config.INTERREP_GROUPS[0],
    `${config.APP_BASE_URL}/h
      i1`
  );
  result = await accessApp(request);
  console.log(result);

  exit(0);
};

waitForConnection().then(() => main());
