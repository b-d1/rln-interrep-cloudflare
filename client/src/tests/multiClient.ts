import config from "../config";
import { generateRequest, getEpoch } from "../apis/rln";
import { NRLN } from "semaphore-lib";
import { registerToInterRep, getWitness, accessApp } from "../utils/requests";
import { exit } from "process";

NRLN.setHasher("poseidon");

const sleep = async (interval: number = 15 * 1000) => {
  await new Promise((r) => setTimeout(r, interval));
};

const rlnIdentifier = config.RLN_IDENTIFIER;
const epoch = getEpoch();

const simulateInteractions = async () => {
  const user1idSecret: bigint[] = NRLN.genIdentitySecrets(config.SPAM_TRESHOLD);
  const user1idCommitment: BigInt = NRLN.genIdentityCommitment(user1idSecret);

  const user2idSecret: bigint[] = NRLN.genIdentitySecrets(config.SPAM_TRESHOLD);
  const user2idCommitment: BigInt = NRLN.genIdentityCommitment(user2idSecret);

  const user3idSecret: bigint[] = NRLN.genIdentitySecrets(config.SPAM_TRESHOLD);
  const user3idCommitment: BigInt = NRLN.genIdentityCommitment(user3idSecret);

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
  await simulateSpam(user1idSecret, user1witness, config.INTERREP_GROUPS[0]);

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
    epoch,
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

  // perform an invalid request from user 2 (old witness)
  console.log("USER 2: REQUEST...");
  request = await generateRequest(
    user2idSecret,
    user2witness,
    rlnIdentifier,
    config.INTERREP_GROUPS[0],
    epoch,
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
  await simulateSpam(user3idSecret, user3witness, config.INTERREP_GROUPS[1]);

  // perform a valid request from user 2
  console.log("USER 2: REQUEST...");
  request = await generateRequest(
    user2idSecret,
    user2witness,
    rlnIdentifier,
    config.INTERREP_GROUPS[0],
    epoch,
    `${config.APP_BASE_URL}/hi2`
  );
  result = await accessApp(request);
  console.log(result);

  exit(0);
};

const simulateSpam = async (
  identitySecret: bigint[],
  witness: string,
  groupId: string
) => {
  // request 1
  let request = await generateRequest(
    identitySecret,
    witness,
    rlnIdentifier,
    groupId,
    epoch,
    `${config.APP_BASE_URL}/hello`
  );
  let result = await accessApp(request);
  console.log(result);

  // request 2 (ok)
  result = await generateRequest(
    identitySecret,
    witness,
    rlnIdentifier,
    groupId,
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
    groupId,
    epoch,
    `${config.APP_BASE_URL}/hi1`
  );
  result = await accessApp(request);
  console.log(result);

  // request 4 (spam)
  request = await generateRequest(
    identitySecret,
    witness,
    rlnIdentifier,
    groupId,
    epoch,
    `${config.APP_BASE_URL}/hi2`
  );
  result = await accessApp(request);
  console.log(result);

  // request 5 (invalid)
  request = await generateRequest(
    identitySecret,
    witness,
    rlnIdentifier,
    groupId,
    epoch,
    `${config.APP_BASE_URL}/hi3`
  );
  result = await accessApp(request);
  console.log(result);

};

simulateInteractions();
