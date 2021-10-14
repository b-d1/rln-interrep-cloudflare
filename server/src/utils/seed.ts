import Group from "../models/group/Group.model";
import {
  MerkleTreeZero,
  MerkleTreeNode,
} from "../models/MerkleTree/MerkleTree.model";
import { merkleTreeController } from "../controllers";
import poseidonHash from "./hasher";
import { getLeaves } from "./requests";

const MERKLE_TREE_LEVELS = 15;
const GROUP_ID = "TWITTER";

const seed = async () => {
  await seedGroup();
  await seedZeros(BigInt(0));
  await syncLeaves();
};

const seedGroup = async () => {
  let group = await Group.findOne({ groupId: GROUP_ID });
  if (!group) {
    group = new Group({ groupId: GROUP_ID });
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
  const nodes = await MerkleTreeNode.find({ "key.level": 0 });
  const leaves = await getLeaves();

  if (leaves.length > nodes.length) {
    const leavesToAdd = leaves.slice(nodes.length);
    console.log("new interrep leaves found: ", leaves.length - nodes.length, leavesToAdd);
    await merkleTreeController.syncTree(GROUP_ID, leavesToAdd);
  }
};

export { seed, seedGroup, syncLeaves };
