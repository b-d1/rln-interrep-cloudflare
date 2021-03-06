import config from "../config";
import { generateRequest } from "../apis/rln";
import { ZkIdentity } from "@libsem/identity";
import { registerToInterRep, getWitness, accessApp, getRlnIdentifierForApp } from "../utils/requests";
import { exit } from "process";

const sleep = async (interval: number = 15 * 1000) => {
  await new Promise((r) => setTimeout(r, interval));
};

const appName = config.APP_NAME;

const simulateInteractions = async () => {

  const rlnIdentifier = await getRlnIdentifierForApp(appName);

  const user1ZkIdentity: ZkIdentity = new ZkIdentity();
  user1ZkIdentity.genRandomSecret(config.SPAM_TRESHOLD);
  const user1idSecret: bigint[] = user1ZkIdentity.getSecret();
  const user1idCommitment: BigInt = user1ZkIdentity.genIdentityCommitmentFromSecret();

  const user2ZkIdentity: ZkIdentity = new ZkIdentity();
  user2ZkIdentity.genRandomSecret(config.SPAM_TRESHOLD);
  const user2idSecret: bigint[] = user2ZkIdentity.getSecret();
  const user2idCommitment: BigInt = user2ZkIdentity.genIdentityCommitmentFromSecret();

  const user3ZkIdentity: ZkIdentity = new ZkIdentity();
  user3ZkIdentity.genRandomSecret(config.SPAM_TRESHOLD);
  const user3idSecret: bigint[] = user3ZkIdentity.getSecret();
  const user3idCommitment: BigInt = user3ZkIdentity.genIdentityCommitmentFromSecret();


  // register user1 to interrep
  console.log("USER 1: REGISTER...");
  await registerToInterRep(
    config.INTERREP_GROUPS[0],
    user1idCommitment.toString()
  );

  // wait 15 seconds for the rln server to fetch the registration
  await sleep();

  // get witness from the rate limiting service
  console.log("USER 1: OBTAIN WITNESS...");
  let user1witness = await getWitness(
    config.INTERREP_GROUPS[0],
    user1idCommitment.toString()
  );

  // spam user 1
  console.log("USER 1: SPAM...");
  await simulateSpam(user1idSecret, user1witness, config.INTERREP_GROUPS[0], rlnIdentifier);

  // register user2 to interrep
  console.log("USER 2: REGISTER...");
  await registerToInterRep(
    config.INTERREP_GROUPS[0],
    user2idCommitment.toString()
  );

  // wait 15 seconds for the rln server to fetch the registration
  await sleep();

  // get witness from the rate limiting service
  console.log("USER 2: OBTAIN WITNESS...");
  const user2witness = await getWitness(
    config.INTERREP_GROUPS[0],
    user2idCommitment.toString()
  );

  // perform a valid request from user 2
  console.log("USER 2: REQUEST...");
  let request = await generateRequest(
    user2idSecret,
    user2witness,
    rlnIdentifier,
    config.INTERREP_GROUPS[0],
    `${config.APP_BASE_URL}/hello`
  );
  let result = await accessApp(request);
  console.log(result);

  // register user2 to interrep
  console.log("USER 3: REGISTER...");

  await registerToInterRep(
    config.INTERREP_GROUPS[1],
    user3idCommitment.toString()
  );

  // wait 15 seconds for the rln server to fetch the registration
  await sleep();

  // get witness from the rate limiting service
  console.log("USER 3: OBTAIN WITNESS...");
  const user3witness = await getWitness(
    config.INTERREP_GROUPS[1],
    user3idCommitment.toString()
  );

  // perform a valid request from user 2
  console.log("USER 2: REQUEST...");
  request = await generateRequest(
    user2idSecret,
    user2witness,
    rlnIdentifier,
    config.INTERREP_GROUPS[0],
    `${config.APP_BASE_URL}/hi1`
  );
  result = await accessApp(request);
  console.log(result);
  // user 1 should not be able to get witness again (he is banned)
  console.log("USER 1: OBTAIN WITNESS...");
  user1witness = await getWitness(
    config.INTERREP_GROUPS[0],
    user1idCommitment.toString()
  );
  console.log(user1witness);

  // spam user 3
  console.log("USER 3: SPAM...");
  await simulateSpam(user3idSecret, user3witness, config.INTERREP_GROUPS[1], rlnIdentifier);

  // perform a valid request from user 2
  console.log("USER 2: REQUEST...");
  request = await generateRequest(
    user2idSecret,
    user2witness,
    rlnIdentifier,
    config.INTERREP_GROUPS[0],
    `${config.APP_BASE_URL}/hi2`
  );
  result = await accessApp(request);
  console.log(result);

  exit(0);
};

const simulateSpam = async (
  identitySecret: bigint[],
  witness: string,
  groupId: string,
  rlnIdentifier: bigint
) => {
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

  // request 4 (ok)
  request = await generateRequest(
    identitySecret,
    witness,
    rlnIdentifier,
    groupId,
    `${config.APP_BASE_URL}/hello`
  );
  result = await accessApp(request);
  console.log(result);

  // request 5 (spam)
  request = await generateRequest(
    identitySecret,
    witness,
    rlnIdentifier,
    groupId,
    `${config.APP_BASE_URL}/hello`
  );
  result = await accessApp(request);
  console.log(result);

  // request 6 (invalid)
  request = await generateRequest(
    identitySecret,
    witness,
    rlnIdentifier,
    groupId,
    `${config.APP_BASE_URL}/hi2`
  );
  result = await accessApp(request);
  console.log(result);

};

simulateInteractions();
