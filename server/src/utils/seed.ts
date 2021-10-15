import Group from "../models/group/Group.model";
import {
  MerkleTreeZero,
  MerkleTreeNode,
} from "../models/MerkleTree/MerkleTree.model";
import { merkleTreeController } from "../controllers";
import poseidonHash from "./hasher";
import { getLeaves } from "./requests";

const MERKLE_TREE_LEVELS = 15;
const INTERREP_GROUPS = ["TWITTER", "GITHUB"];

const seed = async () => {
  await seedGroup(INTERREP_GROUPS[0]);
  await seedGroup(INTERREP_GROUPS[1]);
  await seedZeros(BigInt(0));
  await syncLeaves();
};

const seedGroup = async (groupId: string) => {
  let group = await Group.findOne({ groupId });
  if (!group) {
    group = new Group({ groupId });
    await group.save();
  }
};

const seedZeros = async (zeroValue: BigInt) => {
  const zeroHashes = await MerkleTreeZero.findZeroes();

  if (!zeroHashes || zeroHashes.length === 0) {
    for (let level = 0; level < MERKLE_TREE_LEVELS; level++) {
      zeroValue =
        level === 0 ? zeroValue : poseidonHash([zeroValue, zeroValue]);

      const zeroHashDocument = await MerkleTreeZero.create({
        level,
        hash: zeroValue.toString(),
      });

      await zeroHashDocument.save();
    }
  }
};


const syncLeaves = async () => {
  await syncLeavesByGroup(INTERREP_GROUPS[0]);
  await syncLeavesByGroup(INTERREP_GROUPS[1]);
}

const syncLeavesByGroup = async (groupId: string) => {
  const nodes = await MerkleTreeNode.findAllLeavesByGroup(groupId);
  const leaves = await getLeaves(groupId);


  if (leaves.length > nodes.length) {
    const leavesToAdd = leaves.slice(nodes.length);
    console.log("new interrep leaves found: ", leaves.length - nodes.length, leavesToAdd);
    await merkleTreeController.syncTree(groupId, leavesToAdd);
  }
};


export { seed, seedGroup, syncLeaves };
