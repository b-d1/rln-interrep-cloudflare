import config from "./config";
import express from "express";
import http from "http";
import { seed } from "./utils/seed";
import { initDb } from "./db";
import { userRouter, appRouter } from "./api";
import {sync} from "./interrep_sync"
import {initServer, setSocketListeners } from "./sockets"
const main = async () => {
  // init express and SocketIO
  const app = express();

  const server = http.createServer(app);

  await initDb();
  // seed database if data doesn't exist
  await seed();
  const socketIo = await initServer(server);

  setSocketListeners(socketIo);
  // start interrep syncer
  sync(socketIo);

  app.set('socketio', socketIo);
  app.use(express.json());

  app.use("/users", userRouter);
  app.use("/apps", appRouter);

  app.get("/", (req, res) => {
    res.send("<h1>Welcome to cloudflare rate limiting service.</h1>");
  });

  server.listen(config.SERVER_PORT, () => {
    console.log(`Rate limiting service running on: ${config.SERVER_PORT}`);
  });



};

main();
