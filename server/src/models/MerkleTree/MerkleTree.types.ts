import { Model, Document } from "mongoose";
import {
  findByLevelAndIndex,
  findByGroupIdAndHash,
  findZeroes,
  getNumberOfNodes,
  findAllLeavesByGroup,
  findAllLeaves,
  findRoot,
  getTotalNumberOfLeaves
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
  findAllLeavesByGroup: typeof findAllLeavesByGroup;
  findAllLeaves: typeof findAllLeaves;
  findRoot: typeof findRoot;
  getTotalNumberOfLeaves: typeof getTotalNumberOfLeaves;
}

export interface IMerkleTreeZero {
  level: number;
  hash: string;
}

export interface IMerkleTreeZeroDocument extends IMerkleTreeZero, Document {}

export interface IMerkleTreeZeroModel extends Model<IMerkleTreeZeroDocument> {
  findZeroes: typeof findZeroes;
}