import { Schema } from "mongoose";
import {
  findByLevelAndIndex,
  findByGroupIdAndHash,
  findZeroes,
  getNumberOfNodes,
  findAllLeafsByGroup,
  getLatest,
} from "./MerkleTree.statics";
import {
  IMerkleTreeNode,
  IMerkleTreeNodeDocument,
  IMerkleTreeNodeModel,
  IMerkleTreeZero,
  IMerkleTreeZeroModel,
  IMerkleTreeZeroDocument,
  IMerkleTreeRoot,
  IMerkleTreeRootModel,
  IMerkleTreeRootDocument,
} from "./MerkleTree.types";

// Node
const MerkleTreeNodeSchemaFields: Record<keyof IMerkleTreeNode, any> = {
  key: {
    groupId: String,
    level: Number,
    index: Number,
  },
  parent: {
    type: Schema.Types.ObjectId,
    required: false,
    ref: "MerkleTreeNode",
  },
  siblingHash: String,
  banned: {
    type: Boolean,
    required: false,
  },
  hash: String,
};

export const MerkleTreeNodeSchema = new Schema<
  IMerkleTreeNodeDocument,
  IMerkleTreeNodeModel
>(MerkleTreeNodeSchemaFields);

MerkleTreeNodeSchema.statics.findByLevelAndIndex = findByLevelAndIndex;
MerkleTreeNodeSchema.statics.findByGroupIdAndHash = findByGroupIdAndHash;
MerkleTreeNodeSchema.statics.getNumberOfNodes = getNumberOfNodes;
MerkleTreeNodeSchema.statics.findAllLeafsByGroup = findAllLeafsByGroup;

// Zeroes
export const MerkleTreeZeroSchemaFields: Record<keyof IMerkleTreeZero, any> = {
  level: { type: Number, unique: true },
  hash: String,
};

export const MerkleTreeZeroSchema = new Schema<
  IMerkleTreeZeroDocument,
  IMerkleTreeZeroModel
>(MerkleTreeZeroSchemaFields);

MerkleTreeZeroSchema.statics.findZeroes = findZeroes;

// Roots
export const MerkleTreeRootSchemaFields: Record<keyof IMerkleTreeRoot, any> = {
  hash: String,
};

export const MerkleTreeRootSchema = new Schema<
  IMerkleTreeRootDocument,
  IMerkleTreeRootModel
>(MerkleTreeRootSchemaFields);

MerkleTreeRootSchema.statics.getLatest = getLatest;
