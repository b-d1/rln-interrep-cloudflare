import { merkleTreeController, groupController } from "../controllers";
import {getInterRepLeaves, getInterrepGroups} from "../utils/requests"


const syncLoop = async () => {

    // do an initial sync
    await sync();

    const syncInterval = parseInt(process.env.INTERREP_SYNC_INTERVAL_SECONDS as string, 10) * 1000;
    // start the loop
    setInterval(async () => {
     await sync();
    }, syncInterval)

  }

const sync = async () => {
    const groups = (await getInterrepGroups()).groups;
    await syncGroups(groups);

};

const syncGroups = async (groups) => {
    for(const group of groups) {
        const groupId = group.id;
        const numLeaves = parseInt(group.leafCount, 10);
        const groupExists = await groupController.groupExists(groupId)
        if(!groupExists) {
            await groupController.addGroup(groupId)
        }
        await syncGroup(groupId, numLeaves);
    }
}


const syncGroup = async (groupId: string, leavesInGroup: number) => {
    const numLeavesInDb = await merkleTreeController.getNumLeaves(groupId);

    // we're up to date, no sync needed
    if(numLeavesInDb === leavesInGroup) return;

    const leavesPerChunk = 100;
    const numLeavesMissing = leavesInGroup - numLeavesInDb;
    const fullChunksToFetch = Math.floor(numLeavesMissing / 100);

    const leftoverLeaves = numLeavesMissing % 100;

    for(let i = 0; i < fullChunksToFetch; i++) {
        const first = numLeavesInDb + (i * leavesPerChunk) + leavesPerChunk;
        const skip = numLeavesInDb + (i * leavesPerChunk);
        await syncLeaves(groupId, first, skip)
    }

    if(leftoverLeaves > 0) {
        const first = leavesInGroup;
        const skip = numLeavesInDb + (fullChunksToFetch * leavesPerChunk);
        await syncLeaves(groupId, first, skip)
    }

};

const syncLeaves = async (groupId: string, first: number, skip: number) => {
    const memberData = (await getInterRepLeaves(groupId, first, skip)).group.members;
    const idCommitments = memberData.map(data => data.identityCommitment);
    await merkleTreeController.syncTree(groupId, idCommitments);
}

export {
    syncLoop
}