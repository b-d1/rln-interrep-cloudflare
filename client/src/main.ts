import config from "./config";
import { waitForConnection, initState, getState } from "./apis/socket";
import { registerToInterRep, accessApp, getRlnIdentifierForApp } from "./utils/requests";

import { sleep } from "./utils/utils";
import { generateRequest} from "./apis/rln";
import { ZkIdentity } from "@libsem/identity";

const appName = config.APP_NAME;

const userNormal = async (
  identitySecret: bigint[],
  witness: any,
  groupId: string
) => {
  const rlnIdentifier = await getRlnIdentifierForApp(appName);
  // request 1
  let request = await generateRequest(
    identitySecret,
    witness,
    rlnIdentifier,
    groupId,
    `${config.APP_BASE_URL}/hello`
  );
  let result = await accessApp(request);
  console.log(result);

  // request 2 (ok)
  request = await generateRequest(
    identitySecret,
    witness,
    rlnIdentifier,
    groupId,
    `${config.APP_BASE_URL}/hi`
  );
  result = await accessApp(request);
  console.log(result);

  // request 3 (duplicate)
  request = await generateRequest(
    identitySecret,
    witness,
    rlnIdentifier,
    groupId,
    `${config.APP_BASE_URL}/hi`
  );
  result = await accessApp(request);
  console.log(result);
};

const userSpam = async (
  identitySecret: bigint[],
  witness: any,
  groupId: string
) => {
  const rlnIdentifier = await getRlnIdentifierForApp(appName);
  // request 1
  let request = await generateRequest(
    identitySecret,
    witness,
    rlnIdentifier,
    groupId,
    `${config.APP_BASE_URL}/hello`
  );
  let result = await accessApp(request);
  console.log(result);
  // request 2 (ok)
  request = await generateRequest(
    identitySecret,
    witness,
    rlnIdentifier,
    groupId,
    `${config.APP_BASE_URL}/hello`
  );
  result = await accessApp(request);
  console.log(result);

  // request 3 (ok)
  request = await generateRequest(
    identitySecret,
    witness,
    rlnIdentifier,
    groupId,
    `${config.APP_BASE_URL}/hello`
  );
  result = await accessApp(request);
  console.log(result);

  // request 4 (spam)
  request = await generateRequest(
    identitySecret,
    witness,
    rlnIdentifier,
    groupId,
    `${config.APP_BASE_URL}/hello`
  );
  result = await accessApp(request);
  console.log(result);

  // request 5 (invalid)
  request = await generateRequest(
    identitySecret,
    witness,
    rlnIdentifier,
    groupId,
    `${config.APP_BASE_URL}/hi3`
  );
  result = await accessApp(request);
  console.log(result);
};

const main = async () => {
  const zkIdentity: ZkIdentity = new ZkIdentity();
  zkIdentity.genRandomSecret(config.SPAM_TRESHOLD);
  const idSecret: bigint[] = zkIdentity.getSecret();
  const idCommitment: BigInt = zkIdentity.genIdentityCommitmentFromSecret();

  const args = process.argv.slice(2);
  let groupIndex = 0;

  if (args[1]) {
    groupIndex = parseInt(args[1], 10);
  }
  const group = config.INTERREP_GROUPS[groupIndex];

  initState(group, idCommitment.toString());

  console.log("registering to interrep...");
  await registerToInterRep(group, idCommitment.toString());

  console.log("waiting for rl service to fetch new registrations...");
  await sleep(config.REGISTER_WAIT_SECONDS);

  const witness = getState().witness;
  if (args[0] && args[0] === "spam") {
    await userSpam(idSecret, witness, group);
  } else {
    await userNormal(idSecret, witness, group);
  }
};

waitForConnection().then(() => main());
