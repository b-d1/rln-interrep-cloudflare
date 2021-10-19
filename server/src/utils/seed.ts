import Group from "../models/group/Group.model";
import config from "../config"
import {
  MerkleTreeZero,
  MerkleTreeNode,
} from "../models/MerkleTree/MerkleTree.model";
import { merkleTreeController } from "../controllers";
import poseidonHash from "./hasher";
import { getLeaves } from "./requests";


const seed = async () => {

  await seedZeros(config.ZERO_VALUE);
  for (const group of config.INTERREP_GROUPS) {
    await seedGroup(group);
  }
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
    for (let level = 0; level < config.MERKLE_TREE_LEVELS; level++) {
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

export { seed, seedGroup };
