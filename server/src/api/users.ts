import express from "express";
import { RedirectVerificationStatus, RedirectMessage, SocketEventType } from "../utils/types";
import App from "../models/App/App.model";

import {
  rlnController,
  messageController,
  merkleTreeController,
} from "../controllers";
const router = express.Router();

router.post("/access", async (req, res) => {

  const redirectMessage: RedirectMessage = req.body as RedirectMessage;

  const app = await App.findByUrl(redirectMessage.url);

  if (!app) {
    res.status(400).json({ error: "App not found" });
    return;
  }

  const status: RedirectVerificationStatus = await rlnController.verifyRlnProof(
    redirectMessage
  );

  if (status === RedirectVerificationStatus.VALID) {
    await messageController.registerValidMessage(
      redirectMessage,
      rlnController.genSignalHash(redirectMessage.url)
    );

    res.redirect(307, `${redirectMessage.url}?key=${app.accessKey}`);
  } else {
    if (status === RedirectVerificationStatus.SPAM) {
      const idCommitment = await rlnController.removeUser(redirectMessage);

      await merkleTreeController.updateLeaf(redirectMessage.groupId, idCommitment);

      const socketIo = req.app.get('socketio');

      socketIo.emit(SocketEventType.USER_SLASHED, redirectMessage.groupId, idCommitment);
    }

    res.json({ error: "Invalid verification", status });
  }
});

router.get("/witness/:groupId/:idCommitment", async (req, res) => {

  const groupId = req.params.groupId;
  const idCommitment = req.params.idCommitment;

  try {
    const witness = await merkleTreeController.retrievePath(groupId, idCommitment)
    res.json({data: witness});
  } catch (e: any) {
    res.status(400).json({error: e.message})
  }

})

export default router;
