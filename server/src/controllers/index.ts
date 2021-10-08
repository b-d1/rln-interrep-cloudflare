import MerkleTreeController from "./MerkleTreeController";
import MessageController from "./MessageController";
import RLNController from "./RLNController";

const merkleTreeController = new MerkleTreeController();
const messageController = new MessageController();
const rlnController = new RLNController(
  merkleTreeController,
  messageController
);

export { merkleTreeController, messageController, rlnController };
