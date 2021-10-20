
import config from "../config"
import { Server} from "socket.io";
import {
  MerkleTreeNode,
} from "../models/MerkleTree/MerkleTree.model";
import { merkleTreeController } from "../controllers";
import { getLeaves } from "../utils/requests";
import { SocketEventType } from "../utils/types";


const sync = async (socketIo: Server, interval: number = config.INTERREP_SYNC_INTERVAL_SECONDS * 1000, ) => {
    await syncLeaves(socketIo);
    setInterval( async () => {
      await syncLeaves(socketIo);
    }, interval);

  }

  const syncLeaves = async (socketIo: Server) => {
    console.log("Syncing from interrep...");
    for (const group of config.INTERREP_GROUPS) {
        await syncLeavesByGroup(group, socketIo);
      }
  }

  const syncLeavesByGroup = async (groupId: string, socketIo: Server) => {
    const nodes = await MerkleTreeNode.findAllLeavesByGroup(groupId);
    // Get leaves from InterRep
    const leaves = await getLeaves(groupId);

    if (leaves.length > nodes.length) {
      const leavesToAdd = leaves.slice(nodes.length);
      await merkleTreeController.syncTree(groupId, leavesToAdd);
      socketIo.emit(SocketEventType.USER_REGISTERED, groupId);
    }
  };


  export {
    sync
  }