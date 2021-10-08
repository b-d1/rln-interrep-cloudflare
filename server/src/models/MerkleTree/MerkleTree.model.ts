import { model, models } from "mongoose";
import {
  MerkleTreeNodeSchema,
  MerkleTreeZeroSchema,
  MerkleTreeRootSchema,
} from "./MerkleTree.schema";
import {
  IMerkleTreeNodeDocument,
  IMerkleTreeNodeModel,
  IMerkleTreeZeroDocument,
  IMerkleTreeZeroModel,
  IMerkleTreeRootDocument,
  IMerkleTreeRootModel,
} from "./MerkleTree.types";

const NODE_MODEL_NAME = "MerkleTreeNode";
const ZERO_MODEL_NAME = "MerkleTreeZero";
const ROOT_MODEL_NAME = "MerkleTreeRoot";

export const MerkleTreeNode: IMerkleTreeNodeModel =
  (models[NODE_MODEL_NAME] as IMerkleTreeNodeModel) ||
  model<IMerkleTreeNodeDocument, IMerkleTreeNodeModel>(
    NODE_MODEL_NAME,
    MerkleTreeNodeSchema,
    "treeNodes"
  );

export const MerkleTreeZero: IMerkleTreeZeroModel =
  (models[ZERO_MODEL_NAME] as IMerkleTreeZeroModel) ||
  model<IMerkleTreeZeroDocument, IMerkleTreeZeroModel>(
    ZERO_MODEL_NAME,
    MerkleTreeZeroSchema,
    "treeZeroes"
  );

export const MerkleTreeRoot: IMerkleTreeRootModel =
  (models[ROOT_MODEL_NAME] as IMerkleTreeRootModel) ||
  model<IMerkleTreeRootDocument, IMerkleTreeRootModel>(
    ROOT_MODEL_NAME,
    MerkleTreeRootSchema,
    "treeRoots"
  );
