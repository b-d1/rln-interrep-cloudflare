import express from "express";
import App from "../models/App/App.model";
const router = express.Router();
import { NRln } from "@libsem/protocols"

// List all registered apps
router.get("/", async (req, res) => {
  const registeredApps = await App.find({});

  res.json(registeredApps);
});

// Get app by name
router.get("/:name", async (req, res) => {
  const appName = req.params.name;

  const registeredApp = await App.findOne({ name: appName });
  if (registeredApp) {
    res.json(registeredApp);
  } else {
    res.json({});
  }
});

// Register app
router.post("/register", async (req, res) => {
  const url = new URL(req.body.url);
  const name = req.body.name;
  const accessKey = req.body.accessKey;
  const host = url.host;

  const appExists = await App.findOne({ name });
  if (appExists) {
    res.status(400).json({ error: "The app already exists" });
  } else {

    // The rlnIdentifier should be unique for each app
    const rlnIdentifier = (NRln.genIdentifier()).toString()

    const app = await App.create({
      name,
      host,
      url,
      accessKey,
      rlnIdentifier
    });

    await app.save();

    res.json(app);
  }
});

export default router;
