import { connect } from "mongoose";
import { MerkleTreeNode } from "../models/MerkleTree/MerkleTree.model";

const initDb = async () => {
  await connect("mongodb://root:example@localhost:27017");
};

const testNodeInsert = async () => {
  const node = await MerkleTreeNode.create({
    key: { level: 0, index: 0 },
    hash: "abcd",
  });

  await node.save();
  console.log("node inserted successfully!");
};

export { initDb, testNodeInsert };
