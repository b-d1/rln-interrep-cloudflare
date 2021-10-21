import axios from "axios";
import express from "express";

const APP_PORT = 8082;
const APP_BASE_URL = `http://localhost:${APP_PORT}`;

const APP_NAME = "EXAMPLE_APP";

const RATE_LIMIT_SERVER_BASE_URL = "http://localhost:8080";

// ACCESS_KEY is used just for demo purposes, more sophisticated implementation to be done`
const ACCESS_KEY = "1234";

const init = async () => {
  // init express
  const app = express();
  app.use(express.json());

  // Check access key
  // (this is for demo purposes only, proper authentication to be implemented)
  app.use((req, res, next) => {
    if (req.query.key && req.query.key === ACCESS_KEY) next();
    else res.status(400).json({ error: "Access not allowed" });
  });

  app.get("/", (req, res) => {
    res.send(`Welcome to ${APP_NAME}!`);
  });

  app.post("/hello", (req, res) => {
    res.send({ message: `Hello from ${APP_NAME}!` });
  });

  app.post("/hi", (req, res) => {
    res.send({ message: `Hi from ${APP_NAME}!` });
  });

  app.post("/hi1", (req, res) => {
    res.send({ message: `Hi 1 from ${APP_NAME}!` });
  });

  app.post("/hi2", (req, res) => {
    res.send({ message: `Hi 2 from ${APP_NAME}!` });
  });

  app.post("/hi3", (req, res) => {
    res.send({ message: `Hi 3 from ${APP_NAME}!` });
  });

  // start the Express server
  app.listen(APP_PORT, () => {
    console.log(`EXAMPLE APP server started at http://localhost:${APP_PORT}`);
  });
};

const reigster = async (): Promise<boolean> => {
  let result = await axios.get(
    `${RATE_LIMIT_SERVER_BASE_URL}/apps/${APP_NAME}`
  );
  if (result.data.name && result.data.name === APP_NAME) {
    return true;
  } else {
    const appBody = {
      url: APP_BASE_URL,
      name: APP_NAME,
      accessKey: ACCESS_KEY
    };

    result = await axios.post(
      `${RATE_LIMIT_SERVER_BASE_URL}/apps/register`,
      appBody
    );
    if (result.data.name === APP_NAME) return true;
    return false;
  }
};

reigster().then((res) => {
  if (!res) {
    console.log("Invalid registration");
    return;
  }
  init();
});
