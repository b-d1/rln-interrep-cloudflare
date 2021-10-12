import {
  MerkleTreeZero,
  MerkleTreeNode,
} from "../models/MerkleTree/MerkleTree.model";
import { merkleTreeController } from "../controllers";
import poseidonHash from "./hasher";
import { getLeaves } from "./requests";

const seed = async () => {
  // await seedGroup();
  // await syncLeaves();
  await seedZeros(BigInt(0));
};

// const seedGroup = async () => {
//   let group = await Group.findOne({ groupId: GROUP_ID });
//   if (!group) {
//     group = new Group({ groupId: GROUP_ID });
//     await group.save();
//   }
// };

const seedZeros = async (zeroValue: BigInt) => {
  const zeroHashes = await MerkleTreeZero.findZeroes();

  const merkleTreeLevels = parseInt(process.env.MERKLE_TREE_LEVELS as string, 10);

  if (!zeroHashes || zeroHashes.length === 0) {
    for (let level = 0; level < merkleTreeLevels; level++) {
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

// const syncLeaves = async (groupId: string) => {
//   const nodes = await MerkleTreeNode.find({ "key.level": 0 });
//   const leaves = await getLeaves();

//   if (leaves.length > nodes.length) {
//     const leavesToAdd = leaves.slice(nodes.length);
//     await merkleTreeController.syncTree(groupId, leavesToAdd);
//   }
// };

export { seed };
