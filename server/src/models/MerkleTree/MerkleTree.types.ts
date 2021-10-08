import { Model, Document } from "mongoose";
import {
  findByLevelAndIndex,
  findByGroupIdAndHash,
  findZeroes,
  getNumberOfNodes,
  findAllLeafsByGroup,
  getLatest,
} from "./MerkleTree.statics";

export interface IMerkleTreeNodeKey {
  groupId: string;
  level: number;
  index: number;
}

export interface IMerkleTreeNode {
  key: IMerkleTreeNodeKey;
  parent?: IMerkleTreeNode; // Root node has no parent.
  siblingHash?: string; // Root has no sibling.
  banned?: boolean; // Wether the user is banned or not, only present at level 0 nodes
  hash: string;
}

export interface IMerkleTreeNodeDocument extends IMerkleTreeNode, Document {}

export interface IMerkleTreeNodeModel extends Model<IMerkleTreeNodeDocument> {
  findByLevelAndIndex: typeof findByLevelAndIndex;
  findByGroupIdAndHash: typeof findByGroupIdAndHash;
  getNumberOfNodes: typeof getNumberOfNodes;
  findAllLeafsByGroup: typeof findAllLeafsByGroup;
}

export interface IMerkleTreeZero {
  level: number;
  hash: string;
}

export interface IMerkleTreeZeroDocument extends IMerkleTreeZero, Document {}

export interface IMerkleTreeZeroModel extends Model<IMerkleTreeZeroDocument> {
  findZeroes: typeof findZeroes;
}

export interface IMerkleTreeRoot {
  hash: string;
}

export interface IMerkleTreeRootDocument extends IMerkleTreeRoot, Document {}

export interface IMerkleTreeRootModel extends Model<IMerkleTreeRootDocument> {
  getLatest: typeof getLatest;
}
