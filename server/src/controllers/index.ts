import GroupController from "./GroupController";
import MerkleTreeController from "./MerkleTreeController";
import MessageController from "./MessageController";
import RLNController from "./RLNController";

const groupController = new GroupController();
const merkleTreeController = new MerkleTreeController(groupController);
const messageController = new MessageController();
const rlnController = new RLNController(
  merkleTreeController,
  messageController
);

export { merkleTreeController, messageController, rlnController, groupController };
