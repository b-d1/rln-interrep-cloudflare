const Tree = require("incrementalquintree/build/IncrementalQuinTree");
import { ZkIdentity } from "@libsem/identity";
import poseidonHash from "./hasher";

const trees = {
  "TWITTER": null,
  "GITHUB": null,
}


const init = () => {
  const depth = 15;
  const leavesPerNode = 2;
  const zeroValue = BigInt(0);

  trees.TWITTER = new Tree.IncrementalQuinTree(depth, zeroValue, leavesPerNode, poseidonHash);
  trees.GITHUB = new Tree.IncrementalQuinTree(depth, zeroValue, leavesPerNode, poseidonHash);
  seed(trees.TWITTER);
  seed(trees.GITHUB);
};

// add few dummy IdCommitments in the trees on init, so we have some data to work with
const seed = (tree) => {
  for (let i = 0; i < 10; i++) {
    const identity: ZkIdentity = new ZkIdentity();
    const idCommitment: any = identity.genIdentityCommitment()
    tree.insert(idCommitment);
  }
};

const register = (groupId: string, identityCommitment: BigInt): number => {
  if (trees[groupId].leaves.includes(identityCommitment))
    throw new Error("User already registered");

  trees[groupId].insert(identityCommitment);
  return trees[groupId].nextIndex - 1;
};

const getWitness = (groupId: string, leafIndex: number) => {
  return trees[groupId].genMerklePath(leafIndex);
};

const getLeaves = (groupId: string): BigInt[] => {
  return trees[groupId].leaves;
};

export { init, register, getWitness, getLeaves };
