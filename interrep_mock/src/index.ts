import express from "express";
import { init, getWitness, register, getLeaves } from "./semaphore";
import { serializeWitness } from "./utils";
const groupIds: string[] = ["TWITTER", "GITHUB"];

// init express
const app = express();
const port = 8084;
app.use(express.json());

// init semaphore
init();

app.get("/", (req, res) => {
  res.send("Welcome to InterRep mock.");
});

app.get("/witness/:groupId/:index", (req, res) => {
  try {

    const groupId = req.params.groupId;
    if(!groupIds.includes(groupId)) {
      res.status(400).json({error: "Group unsupported."});
      return;
    }

    const index = parseInt(req.params.index, 10);

    const witness = getWitness(groupId, index);
    res.json(serializeWitness(witness));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/register/:groupId/:idCommitment", (req, res) => {
  try {
    const groupId = req.params.groupId;
    if(!groupIds.includes(groupId)) {
      res.status(400).json({error: "Group unsupported."});
      return;
    }

    const identityCommitment = BigInt(req.params.idCommitment);
    const index = register(groupId, identityCommitment);
    const witness = getWitness(groupId, index);
    res.json({ index, witness: serializeWitness(witness) });
  } catch (e: any) {
    if (e.message === "User already registered") {
      res.status(400);
    } else {
      res.status(500);
    }
    res.json({ error: e.message });
  }
});

app.get("/leaves/:groupId", (req, res) => {
  try {

    const groupId = req.params.groupId;
    if(!groupIds.includes(groupId)) {
      res.status(400).json({error: "Group unsupported."});
      return;
    }

    const leaves = getLeaves(groupId).map((leaf) => leaf.toString());
    res.json(leaves);
  } catch (e: any) {
    res.json({ error: e.message });
  }
});

// start the Express server
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
