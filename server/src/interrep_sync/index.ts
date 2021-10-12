import { merkleTreeController, groupController } from "../controllers";
import {getInterRepLeaves, getInterrepGroups} from "../utils/requests"


const sync = async () => {
    const groups = (await getInterrepGroups()).groups;
    await syncGroups(groups);

};

const syncGroups = async (groups) => {
    for(const group of groups) {
        const groupId = group.id;
        const numLeaves = group.leafCount;
        const groupExists = await groupController.groupExists(groupId)
        if(!groupExists) {
            await groupController.addGroup(groupId)
        }
        await syncGroup(groupId, numLeaves);
    }
}


const syncGroup = async (groupId: string, leavesInGroup: number) => {
    const numLeavesInDb = await merkleTreeController.getNumLeaves();

    // we're up to date, no sync needed
    if(numLeavesInDb === leavesInGroup) return;

    const leavesPerChunk = 100;
    const numLeavesMissing = leavesInGroup - numLeavesInDb;
    const fullChunksToFetch = Math.floor(numLeavesMissing / 100);

    const leftoverLeaves = numLeavesMissing % 100;

    for(let i = 0; i < fullChunksToFetch; i++) {
        const first = numLeavesInDb + (i * leavesPerChunk) + leavesPerChunk;
        const skip = numLeavesInDb + (i * leavesPerChunk);
        const result = await syncLeaves(groupId, first, skip)
    }

    if(leftoverLeaves > 0) {
        const first = leavesInGroup;
        const skip = numLeavesInDb + (fullChunksToFetch * leavesPerChunk);
        const result = await syncLeaves(groupId, first, skip)
    }

};

const syncLeaves = async (groupId: string, first: number, skip: number) => {
    const memberData = (await getInterRepLeaves(groupId, first, skip)).group.members;
    const idCommitments = memberData.map(data => data.identityCommitment);
    const result = await merkleTreeController.syncTree(groupId, idCommitments);
    return result;
}

export {
    sync
}