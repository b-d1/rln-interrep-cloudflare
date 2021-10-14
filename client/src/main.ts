// Single user vote

import { registerToInterRep, visitApp, getWitness } from "./api";
import { NRLN, Identity } from "semaphore-lib";
import { deserializeWitness } from "./utils";
import { exit } from "process";
const INTERREP_GROUP = "TWITTER";
const SPAM_THRESHOLD = 3;

NRLN.setHasher("poseidon");
const APP_BASE_URL = "http://localhost:8082";

const sleep = async (interval: number = 25 * 1000) => {
  await new Promise(r => setTimeout(r, interval));
}

const main = async () => {
  const identitySecret: bigint[] = NRLN.genIdentitySecrets(SPAM_THRESHOLD);
  const identityCommitment: BigInt = NRLN.genIdentityCommitment(identitySecret);

  // Register to interrep
  const userData = await registerToInterRep(identityCommitment);
  const rlnIdentifier = BigInt(5);
  console.log("user registered to interrep");
  // wait 15 seconds for the rln server to fetch the registration
  await sleep();

  // get witness from the rate limiting service
  const witness = await getWitness(INTERREP_GROUP, identityCommitment)
  console.log("witness obtained");
  // const epoch = (Math.floor((new Date()).getTime() / (1000 * 60))).toString()
  const epoch = "test-epoch";

  // Visit app

  // request 1
  let result = await visitApp(
    identitySecret,
    witness,
    rlnIdentifier,
    INTERREP_GROUP,
    epoch,
    `${APP_BASE_URL}/hello`
  );
  console.log(result);

    // request 2(ok)
    result = await visitApp(
      identitySecret,
      witness,
      rlnIdentifier,
      INTERREP_GROUP,
      epoch,
      `${APP_BASE_URL}/hi`
    );
    console.log(result);

    // request 3 (ok)
    result = await visitApp(
      identitySecret,
      witness,
      rlnIdentifier,
      INTERREP_GROUP,
      epoch,
      `${APP_BASE_URL}/hi1`
    );
    console.log(result);

  // request 4 (duplicate)
  result = await visitApp(
    identitySecret,
    witness,
    rlnIdentifier,
    INTERREP_GROUP,
    epoch,
    `${APP_BASE_URL}/hello`
  );
  console.log(result);

  // request 5 (spam)
  result = await visitApp(
    identitySecret,
    witness,
    rlnIdentifier,
    INTERREP_GROUP,
    epoch,
    `${APP_BASE_URL}/hi2`
  );
  console.log(result);

  // request 5 (request should be flagged early as duplicate)
  result = await visitApp(
    identitySecret,
    witness,
    rlnIdentifier,
    INTERREP_GROUP,
    epoch,
    `${APP_BASE_URL}/hello`
  );
  console.log(result);

  // request 6 (request should be invalid - the idCommitment is removed from the tree)
  result = await visitApp(
    identitySecret,
    witness,
    rlnIdentifier,
    INTERREP_GROUP,
    epoch,
    `${APP_BASE_URL}/hi3`
  );
  console.log(result);

  exit(0);
};

main();
