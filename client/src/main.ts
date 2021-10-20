import config from "./config";
import { waitForConnection, initState, getState } from "./apis/socket";
import { registerToInterRep, accessApp } from "./utils/requests";

import { sleep } from "./utils/utils";
import { generateRequest, getEpoch } from "./apis/rln";
import { ZkIdentity } from "@libsem/identity";

const rlnIdentifier = config.RLN_IDENTIFIER;
const epoch = getEpoch();

const userNormal = async (
    identitySecret: bigint[],
    witness: any,
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
    request = await generateRequest(
        identitySecret,
        witness,
        rlnIdentifier,
        groupId,
        epoch,
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
        epoch,
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
    request = await generateRequest(
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

const main = async () => {
    const idSecret: bigint[] = ZkIdentity.genRandomSecret(config.SPAM_TRESHOLD);
    const idCommitment: BigInt = ZkIdentity.genIdentityCommitmentFromSecret(idSecret);

    const args = process.argv.slice(2);
    let groupIndex = 0;

    if (args[1]) {
        groupIndex = parseInt(args[1], 10);
    }
    console.log("group index", groupIndex);
    const group = config.INTERREP_GROUPS[groupIndex];

    initState(group, idCommitment.toString());

    console.log("registering to interrep...");
    await registerToInterRep(group, idCommitment.toString());

    console.log("waiting for rl service to fetch new registrations...");
    await sleep(config.REGISTER_WAIT_SECONDS);

    const witness = getState().witness;
    if (args[0] && args[0] === 'spam') {
        await userSpam(idSecret, witness, group);
    } else {
        await userNormal(idSecret, witness, group);
    }


};

waitForConnection().then(() => main());
