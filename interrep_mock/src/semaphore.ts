import { FastSemaphore } from "semaphore-lib";

const trees = {
  "TWITTER": null,
  "GITHUB": null,
}


const init = () => {
  const depth = 15;
  const leavesPerNode = 2;
  const zeroValue = BigInt(0);
  FastSemaphore.setHasher("poseidon");

  trees.TWITTER = FastSemaphore.createTree(depth, zeroValue, leavesPerNode);
  trees.GITHUB = FastSemaphore.createTree(depth, zeroValue, leavesPerNode);
  seed(trees.TWITTER);
  seed(trees.GITHUB);
};

// add few dummy IdCommitments in the tree on init, so we have some data to work with
const seed = (tree) => {
  for (let i = 0; i < 10; i++) {
    const identity = FastSemaphore.genIdentity();
    const idCommitment: any = FastSemaphore.genIdentityCommitment(identity);
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
