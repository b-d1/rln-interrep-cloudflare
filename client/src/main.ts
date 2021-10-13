import { visitApp, getIdentity, Identity } from "./rln";
import { exit } from "process";
import { registerToInterRepGroup, getInterRepUserStatus, getInterRepWitness } from "./requests";

import dotenv from "dotenv";

dotenv.config();

const main = async () => {
  const identity: Identity = getIdentity();
  const rlnIdentifier = BigInt(5);

  // Register to interrep, if not registered already
  const isRegistered = await getInterRepUserStatus(identity.idCommitment as bigint);
  if(!isRegistered) {
    await registerToInterRepGroup(identity.idCommitment as bigint);
  }

  // get witness
  const witness = await getInterRepWitness(identity.idCommitment as bigint);


  const epoch = "test-epoch";

  // Visit app

  // request 1
  let result = await visitApp(
    identity.secret as bigint,
    witness,
    rlnIdentifier,
    process.env.INTERREP_GROUP_ID as string,
    epoch,
    `${process.env.APP_BASE_URL}/hello`
  );
  console.log(result);

  // request 2 (duplicate)
  result = await visitApp(
    identity.secret as bigint,
    witness,
    rlnIdentifier,
    process.env.INTERREP_GROUP_ID as string,
    epoch,
    `${process.env.APP_BASE_URL}/hello`
  );
  console.log(result);

  // request 3 (spam)
  result = await visitApp(
    identity.secret as bigint,
    witness,
    rlnIdentifier,
    process.env.INTERREP_GROUP_ID as string,
    epoch,
    `${process.env.APP_BASE_URL}/hi`
  );
  console.log(result);

  // request 4 (request should be flagged early as duplicate)
  result = await visitApp(
    identity.secret as bigint,
    witness,
    rlnIdentifier,
    process.env.INTERREP_GROUP_ID as string,
    epoch,
    `${process.env.APP_BASE_URL}/hello`
  );
  console.log(result);

  // request 5 (request should be invalid - the idCommitment is removed from the tree)
  result = await visitApp(
    identity.secret as bigint,
    witness,
    rlnIdentifier,
    process.env.INTERREP_GROUP_ID as string,
    epoch,
    `${process.env.APP_BASE_URL}/`
  );
  console.log(result);

  exit(0);
};

main();
