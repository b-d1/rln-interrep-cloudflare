import {
    FastSemaphore
} from "semaphore-lib";

let tree: any = null;

const init = () => {
    const depth = 15;
    const leavesPerNode = 2;
    const zeroValue = BigInt(0);
    FastSemaphore.setHasher("poseidon");
    tree = FastSemaphore.createTree(depth, zeroValue, leavesPerNode);
    seed();
}

// add few dummy IdCommitments in the tree on init, so we have some data to work with
const seed = () => {

    for (let i=0; i<10;i++) {
        const identity = FastSemaphore.genIdentity();
        const idCommitment: any = FastSemaphore.genIdentityCommitment(identity);
        tree.insert(idCommitment);
      }

}

const register = (identityCommitment: BigInt): number => {
    if(tree.leaves.includes(identityCommitment)) throw new Error("User already registered");

    tree.insert(identityCommitment);
    return tree.nextIndex - 1;
}

const getWitness = (leafIndex: number) => {
    return tree.genMerklePath(leafIndex);
}

const getLeaves = (): BigInt[] => {
    return tree.leaves;
}

export {
    init,
    register,
    getWitness,
    getLeaves
}