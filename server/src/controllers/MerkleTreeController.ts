import {
  MerkleTreeNode,
  MerkleTreeZero,
  MerkleTreeRoot,
} from "../models/MerkleTree/MerkleTree.model";
import { IMerkleTreeNodeDocument } from "../models/MerkleTree/MerkleTree.types";
import poseidonHash from "../utils/hasher";
import GroupController from "./GroupController";
const Tree = require("incrementalquintree/build/IncrementalQuinTree");

// Zero value complies with the InterRep semaphore groups zero value
const ZERO_VALUE = BigInt(0);

class MerkleTreeController {


  groupController: GroupController;

  constructor(
    groupController: GroupController,
  ) {
    this.groupController = groupController;
  }

  public syncTree = async (
    groupId: string,
    idCommitments: string[]
  ): Promise<boolean> => {
    let root: string = "";
    for (const idCommitment of idCommitments) {
      root = await this.appendLeaf(groupId, idCommitment);
    }

    const treeRoot = new MerkleTreeRoot({ hash: root });
    treeRoot.save();
    return true;
  };

  public banUser = async (
    groupId: string,
    idCommitment: string
  ): Promise<number> => {
    const groupExists = await this.groupController.groupExists(groupId);

    if (!groupExists) {
      throw new Error(`The group ${groupId} does not exist`);
    }

    const node = await MerkleTreeNode.findByGroupIdAndHash(
      groupId,
      idCommitment
    );

    if (!node) {
      throw new Error(
        `The user with identity commitment ${idCommitment} doesn't exists`
      );
    }
    node.banned = true;
    await node.save();
    return node.key.index;
  };

  public appendLeaf = async (
    groupId: string,
    idCommitment: string
  ): Promise<string> => {
    const groupExists = await this.groupController.groupExists(groupId);

    if (!groupExists) {
      throw new Error(`The group ${groupId} does not exist`);
    }


    if (await MerkleTreeNode.findByGroupIdAndHash(groupId, idCommitment)) {
      throw new Error(`The identity commitment ${idCommitment} already exist`);
    }

    // Get the zero hashes.
    const zeroes = await MerkleTreeZero.findZeroes();

    if (!zeroes || zeroes.length === 0) {
      throw new Error(`The zero hashes have not yet been created`);
    }

    // Get next available index at level 0.
    let currentIndex = await MerkleTreeNode.getNumberOfNodes(groupId, 0);

    const merkleTreeLevels = parseInt(process.env.MERKLE_TREE_LEVELS as string, 10);

    if (currentIndex >= 2 ** merkleTreeLevels) {
      throw new Error(`The tree is full`);
    }

    let node: any = await MerkleTreeNode.create({
      key: { groupId, level: 0, index: currentIndex },
      hash: idCommitment
    });

    for (let level = 0; level < merkleTreeLevels; level++) {
      if (currentIndex % 2 === 0) {
        node.siblingHash = zeroes[level].hash;

        let parentNode = await MerkleTreeNode.findByLevelAndIndex({
          groupId,
          level: level + 1,
          index: Math.floor(currentIndex / 2),
        });

        if (parentNode) {
          parentNode.hash = poseidonHash([
            BigInt(node.hash),
            BigInt(node.siblingHash),
          ]).toString();

          await parentNode.save();
        } else {
          parentNode = await MerkleTreeNode.create({
            key: {
              groupId,
              level: level + 1,
              index: Math.floor(currentIndex / 2),
            },
            hash: poseidonHash([BigInt(node.hash), BigInt(node.siblingHash)]),
          });
        }

        node.parent = parentNode;

        await node.save();

        node = parentNode;
      } else {
        const siblingNode = (await MerkleTreeNode.findByLevelAndIndex({
          groupId,
          level,
          index: currentIndex - 1,
        })) as IMerkleTreeNodeDocument;

        node.siblingHash = siblingNode.hash;
        siblingNode.siblingHash = node.hash;

        const parentNode = (await MerkleTreeNode.findByLevelAndIndex({
          groupId,
          level: level + 1,
          index: Math.floor(currentIndex / 2),
        })) as IMerkleTreeNodeDocument;

        parentNode.hash = poseidonHash([
          BigInt(siblingNode.hash),
          BigInt(node.hash),
        ]).toString();

        node.parent = parentNode;

        await node.save();
        await parentNode.save();
        await siblingNode.save();

        node = parentNode;
      }

      currentIndex = Math.floor(currentIndex / 2);
    }

    return node.hash;
  };

  public updateLatestRoot = async (groupId: string): Promise<boolean> => {
    const newRootHash = await this.previewNewRoot(groupId);
    const newRoot = new MerkleTreeRoot({ hash: newRootHash });
    await newRoot.save();
    return true;
  };

  public previewNewRoot = async (groupId: string): Promise<string> => {
    const groupExists = await this.groupController.groupExists(groupId);

    if (!groupExists) {
      throw new Error(`The group ${groupId} does not exist`);
    }


    const leafNodes = await MerkleTreeNode.findAllLeafsByGroup(groupId);
    const tree = new Tree.IncrementalQuinTree(
      parseInt(process.env.MERKLE_TREE_LEVELS as string, 10),
      ZERO_VALUE,
      2,
      poseidonHash
    );

    for (const leafNode of leafNodes) {
      if (!leafNode.banned) {
        tree.insert(BigInt(leafNode.hash));
      } else {
        tree.insert(poseidonHash([ZERO_VALUE]));
      }
    }
    return tree.root.toString();
  };

  // Not used currently, the users should retreive their witness from InterRep
  public retrievePath = async (
    groupId: string,
    idCommitment: string
  ): Promise<any> => {
    const groupExists = await this.groupController.groupExists(groupId);

    if (!groupExists) {
      throw new Error(`The group ${groupId} does not exist`);
    }

    // Get path starting from leaf node.
    const leafNode = await MerkleTreeNode.findByGroupIdAndHash(
      groupId,
      idCommitment
    );

    if (!leafNode) {
      throw new Error(`The identity commitment does not exist`);
    }

    const { key } = leafNode;

    // Get path and return array.
    const pathQuery = MerkleTreeNode.aggregate([
      {
        $match: {
          key,
        },
      },
      {
        $graphLookup: {
          from: "treeNodes",
          startWith: "$_id",
          connectFromField: "parent",
          connectToField: "_id",
          as: "path",
          depthField: "level",
        },
      },
      {
        $unwind: {
          path: "$path",
        },
      },
      {
        $project: {
          path: 1,
          _id: 0,
        },
      },
      {
        $addFields: {
          hash: "$path.hash",
          sibling: "$path.siblingHash",
          index: { $mod: ["$path.key.index", 2] },
          level: "$path.level",
        },
      },
      {
        $sort: {
          level: 1,
        },
      },
      {
        $project: {
          path: 0,
        },
      },
    ]);

    return new Promise((resolve, reject) => {
      pathQuery.exec((error, path) => {
        if (error) {
          reject(error);
        }

        const root = path.pop().hash;
        const pathElements = path.map((n) => n.sibling);
        const indices = path.map((n) => n.index);

        resolve({ pathElements, indices, root });
      });
    });
  };

  public getNumLeaves = async (): Promise<number> => {
    const nodes = await MerkleTreeNode.find({ "key.level": 0 });
    return nodes.length;
  }

  public seedZeros = async (zeroValue: BigInt = BigInt(0)) => {
    const zeroHashes = await MerkleTreeZero.findZeroes();

    const merkleTreeLevels = parseInt(process.env.MERKLE_TREE_LEVELS as string, 10);

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

    console.log("Zeroes seeded");

  };

}

export default MerkleTreeController;
