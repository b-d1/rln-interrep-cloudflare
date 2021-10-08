// Single user vote

import {registerToInterRep, visitApp} from './api'
import {
    RLN, Identity
} from "semaphore-lib";
import {deserializeWitness} from './utils'
import { exit } from 'process';
const SPAM_REQUEST_LIMIT = 1;
const INTERREP_GROUP = 'TWITTER';


RLN.setHasher('poseidon');
const APP_BASE_URL = 'http://localhost:8082'

const main = async () => {

    const identity: Identity = RLN.genIdentity();
    const identitySecret: bigint = RLN.calculateIdentitySecret(identity);
    const identityCommitment: BigInt = RLN.genIdentityCommitment(identitySecret);

    // Register to interrep
    const userData = await registerToInterRep(identityCommitment);
    const rlnIdentifier = BigInt(5);
    const witness = deserializeWitness(userData.witness);

    // the epoch is the current unix timestamp for the minute
    // we simulate with 2 requests per minute
    // const epoch = (Math.floor((new Date()).getTime() / (1000 * 60))).toString()
    const epoch = "test-epoch"


    // Visit app
    const result = await visitApp(identitySecret, witness, rlnIdentifier, INTERREP_GROUP, epoch, `${APP_BASE_URL}/hello`);

    console.log("Data: ", result);

    exit(0);

};

main();