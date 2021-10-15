import express from "express";
import { Server } from "socket.io";
import { RedirectVerificationStatus, RedirectMessage } from "../utils/types";
import { syncLeaves } from "../utils/seed";
import App from "../models/App/App.model";

import {
  rlnController,
  messageController,
  merkleTreeController,
} from "../controllers";
const router = express.Router();

// ACCESS_KEY is used just for demo purposes, more sophisticated implementation to be done`
const ACCESS_KEY = "1234";

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

    res.redirect(307, `${redirectMessage.url}?key=${ACCESS_KEY}`);
  } else {
    if (status === RedirectVerificationStatus.SPAM) {
      await rlnController.removeUser(redirectMessage);
      await merkleTreeController.updateTree(redirectMessage.groupId);
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
