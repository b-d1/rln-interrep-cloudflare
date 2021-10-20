import {
  MerkleTreeZero,
  MerkleTreeNode,
} from "../models/MerkleTree/MerkleTree.model";
import config from "../config";
import { merkleTreeController } from "../controllers";
import poseidonHash from "./hasher";
import { getLeaves } from "./requests";

const seed = async () => {
  await seedZeros(config.ZERO_VALUE);
};



const seedZeros = async (zeroValue: BigInt) => {
  const zeroHashes = await MerkleTreeZero.findZeroes();

  const merkleTreeLevels = config.MERKLE_TREE_LEVELS

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


export { seed };
