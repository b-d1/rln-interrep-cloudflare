import express from "express";
import { Server } from "socket.io";
import { RedirectVerificationStatus, RedirectMessage } from "../utils/types";
import {syncLeaves} from "../utils/seed"
import App from "../models/App/App.model";

import {
  rlnController,
  messageController,
  merkleTreeController,
} from "../controllers";
const router = express.Router();

// We don't need this actually
// Register user
// router.post("/register", async (req, res) => {
//   try {
//     const registerInputs = req.body as RegisterInputs;

//     const semaphoreRegisterStatus: SemaphoreProofStatus =
//       await verifySemaphoreProof(registerInputs);
//     if (semaphoreRegisterStatus === SemaphoreProofStatus.INVALID) {
//       res.status(400).json({ error: "Invalid InterRep membership." });
//       return;
//     }

//     const user = await User.findOne({
//       idCommitment: registerInputs.identityCommitment,
//     });

//     if (user) {
//       // The user already exists
//       res.status(400);
//       if (user.banned) {
//         res.json({
//           error: "Invalid registration",
//           status: UserRegistrationStatus.BANNED,
//         });
//       } else {
//         res.json({
//           error: "Invalid registration",
//           status: UserRegistrationStatus.ALREADY_REGISTERED,
//         });
//       }
//     } else {
//       const rlnRegisterStatus = register(
//         BigInt(registerInputs.identityCommitment)
//       );
//       rlnRegisterStatus.witness = serializeWitness(
//         getWitness(rlnRegisterStatus.leafIndex as number)
//       );

//       const newUser = new User({
//         idCommitment: registerInputs.identityCommitment,
//         leafIndex: rlnRegisterStatus.leafIndex,
//         banned: false,
//       });
//       await newUser.save();

//       const socketIo: Server = req.io;
//       socketIo.emit(SocketEventType.USER_REGISTERED);

//       res.json(rlnRegisterStatus);
//     }
//   } catch (e: any) {
//     if (e.message === "User already registered") {
//       res.status(400);
//     } else {
//       res.status(500);
//     }
//     res.json({ error: e.message });
//   }
// });

router.post("/access", async (req, res) => {

  // TODO: remove syncing before access, create a separate background syncing process
  await syncLeaves();

  const redirectMessage: RedirectMessage = req.body as RedirectMessage;

  const app = await App.findByUrl(redirectMessage.url);


  console.log("app", app);
  if (!app) {
    console.log("app not found")
    res.status(400).json({ error: "App not found" });
    return;
  }

  console.log("verifying rln proof...")
  const status: RedirectVerificationStatus = await rlnController.verifyRlnProof(
    redirectMessage
  );

    console.log("proof verify status", status)

  if (status === RedirectVerificationStatus.VALID) {
    messageController.registerValidMessage(
      redirectMessage,
      rlnController.genSignalHash(redirectMessage.url)
    );

    res.redirect(redirectMessage.url);
  } else {
    if (status === RedirectVerificationStatus.SPAM) {
      await rlnController.removeUser(redirectMessage);
      await merkleTreeController.updateLatestRoot(redirectMessage.groupId);
    }

    res.status(400).json({ error: "Invalid verification", status });
  }
});

export default router;
