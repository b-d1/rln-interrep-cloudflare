// Single user vote

import { visitApp } from "./api";
import { NRLN } from "semaphore-lib";
import { registerToInterRep, getWitness } from "./requests";
import { exit } from "process";
const INTERREP_GROUPS: string[] = ["TWITTER", "GITHUB"];
const SPAM_THRESHOLD = 3;

NRLN.setHasher("poseidon");
const APP_BASE_URL = "http://localhost:8082";

const sleep = async (interval: number = 15 * 1000) => {
  await new Promise((r) => setTimeout(r, interval));
};

const rlnIdentifier = BigInt(5);
const epoch = "test-epoch";

const simulateInteractions = async () => {
  const user1idSecret: bigint[] = NRLN.genIdentitySecrets(SPAM_THRESHOLD);
  const user1idCommitment: BigInt = NRLN.genIdentityCommitment(user1idSecret);

  const user2idSecret: bigint[] = NRLN.genIdentitySecrets(SPAM_THRESHOLD);
  const user2idCommitment: BigInt = NRLN.genIdentityCommitment(user2idSecret);

  const user3idSecret: bigint[] = NRLN.genIdentitySecrets(SPAM_THRESHOLD);
  const user3idCommitment: BigInt = NRLN.genIdentityCommitment(user3idSecret);

  // register user1 to interrep
  console.log("Registering user1...")
  await registerToInterRep(INTERREP_GROUPS[0], user1idCommitment.toString());

  // wait 15 seconds for the rln server to fetch the registration
  await sleep();

  // get witness from the rate limiting service
  console.log("Obtaining witness for user1...")
  let user1witness = await getWitness(
    INTERREP_GROUPS[0],
    user1idCommitment.toString()
  );

  // spam user 1
  console.log("Spamming from user1...")
  await simulateSpam(
    user1idSecret,
    user1witness,
    INTERREP_GROUPS[0],
  );

  // register user2 to interrep
  console.log("Registering user2...")
  await registerToInterRep(INTERREP_GROUPS[0], user2idCommitment.toString());

  // wait 15 seconds for the rln server to fetch the registration
  await sleep();

  // get witness from the rate limiting service
  console.log("Obtaining witness for user2...")
  const user2witness = await getWitness(
    INTERREP_GROUPS[0],
    user2idCommitment.toString()
  );

  // perform a valid request from user 2
  console.log("Requesting from user2 (valid)...")
  let result = await visitApp(
    user2idSecret,
    user2witness,
    rlnIdentifier,
    INTERREP_GROUPS[0],
    epoch,
    `${APP_BASE_URL}/hello`
  );
  console.log(result);

  // register user2 to interrep
  console.log("Registering user3...")

  await registerToInterRep(INTERREP_GROUPS[1], user3idCommitment.toString());

  // wait 15 seconds for the rln server to fetch the registration
  await sleep();

  // get witness from the rate limiting service
  console.log("Obtaining witness for user3...")
  const user3witness = await getWitness(
    INTERREP_GROUPS[1],
    user3idCommitment.toString()
  );

  // perform an invalid request from user 2 (old witness)
  console.log("Requesting from user2 (valid), the witness is not old because user2 and user3 are at different groups")
  result = await visitApp(
    user2idSecret,
    user2witness,
    rlnIdentifier,
    INTERREP_GROUPS[0],
    epoch,
    `${APP_BASE_URL}/hi1`
  );
  console.log(result);

  // user 1 should not be able to get witness again (he is banned)
  console.log("Obtaining new witness for user1 (invalid, banned)...")
  user1witness = await getWitness(
    INTERREP_GROUPS[0],
    user1idCommitment.toString()
  );
  console.log(user1witness);

  // spam user 3
  console.log("Spamming from user3...")
  await simulateSpam(
    user3idSecret,
    user3witness,
    INTERREP_GROUPS[1],
  );

  // perform a valid request from user 2
  console.log("Requesting from user2 (valid)...")
  result = await visitApp(
    user2idSecret,
    user2witness,
    rlnIdentifier,
    INTERREP_GROUPS[0],
    epoch,
    `${APP_BASE_URL}/hi2`
  );
  console.log(result);

  exit(0);


};

const simulateSpam = async (
  identitySecret: bigint[],
  witness: string,
  groupId: string,
) => {
  // request 1
  let result = await visitApp(
    identitySecret,
    witness,
    rlnIdentifier,
    groupId,
    epoch,
    `${APP_BASE_URL}/hello`
  );
  console.log(result);

  // request 2 (ok)
  result = await visitApp(
    identitySecret,
    witness,
    rlnIdentifier,
    groupId,
    epoch,
    `${APP_BASE_URL}/hi`
  );
  console.log(result);

  // request 3 (ok)
  result = await visitApp(
    identitySecret,
    witness,
    rlnIdentifier,
    groupId,
    epoch,
    `${APP_BASE_URL}/hi1`
  );
  console.log(result);

  // request 4 (spam)
  result = await visitApp(
    identitySecret,
    witness,
    rlnIdentifier,
    groupId,
    epoch,
    `${APP_BASE_URL}/hi2`
  );
  console.log(result);

  // request 5 (invalid)
  result = await visitApp(
    identitySecret,
    witness,
    rlnIdentifier,
    groupId,
    epoch,
    `${APP_BASE_URL}/hi3`
  );
  console.log(result);
};

const simulateDuplicate = async (
  identitySecret: bigint[],
  witness: string,
  groupId: string,
) => {
  // request 1
  let result = await visitApp(
    identitySecret,
    witness,
    rlnIdentifier,
    groupId,
    epoch,
    `${APP_BASE_URL}/hello`
  );
  console.log(result);

  // request 2 (duplicate)
  result = await visitApp(
    identitySecret,
    witness,
    rlnIdentifier,
    groupId,
    epoch,
    `${APP_BASE_URL}/hello`
  );
  console.log(result);
};

simulateInteractions();