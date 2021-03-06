import { Schema } from "mongoose";
import {
  findByLevelAndIndex,
  findLeafByGroupIdAndHash,
  findZeroes,
  getNumberOfNodes,
  findAllLeaves,
  findAllLeavesByGroup,
  findRoot,
  getTotalNumberOfLeaves
} from "./MerkleTree.statics";
import {
  IMerkleTreeNode,
  IMerkleTreeNodeDocument,
  IMerkleTreeNodeModel,
  IMerkleTreeZero,
  IMerkleTreeZeroModel,
  IMerkleTreeZeroDocument,

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
MerkleTreeNodeSchema.statics.findLeafByGroupIdAndHash = findLeafByGroupIdAndHash;
MerkleTreeNodeSchema.statics.getNumberOfNodes = getNumberOfNodes;
MerkleTreeNodeSchema.statics.findAllLeavesByGroup = findAllLeavesByGroup;
MerkleTreeNodeSchema.statics.findAllLeaves = findAllLeaves;
MerkleTreeNodeSchema.statics.findRoot = findRoot;
MerkleTreeNodeSchema.statics.getTotalNumberOfLeaves = getTotalNumberOfLeaves;

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
