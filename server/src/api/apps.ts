import express from "express";
import App from "../models/App/App.model";
import RequestStats from "../models/RequestStats/RequestStats.model";
const router = express.Router();

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
  const host = url.host;

  const appExists = await App.findOne({ name });
  if (appExists) {
    res.status(400).json({ error: "The app already exists" });
  } else {
    const app = await App.create({
      name,
      host,
      url,
    });

    await app.save();

    const requestStats = await RequestStats.create({
      app,
      epochs: [],
    });

    await requestStats.save();

    res.json({
      app,
      requestStats,
    });
  }
});

export default router;
