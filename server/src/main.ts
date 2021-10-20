import express from "express";
import http from "http";
import { syncLoop } from "./interrep_sync";
import { initDb } from "./db";
import { userRouter, appRouter } from "./api";
import { seed } from "./utils/seed";
import dotenv from 'dotenv';
import {initServer, setSocketListeners } from "./sockets"

dotenv.config();

const main = async () => {
  // init express and SocketIO
  const app = express();

  const server = http.createServer(app);

  await initDb();
  // seed db if necessary
  await seed();
  const socketIo = await initServer(server);

  setSocketListeners(socketIo);
  syncLoop(socketIo);

  app.set('socketio', socketIo);
  app.use(express.json());

  app.use("/users", userRouter);
  app.use("/apps", appRouter);

  app.get("/", (req, res) => {
    res.send("<h1>Welcome to cloudflare rate limiting service.</h1>");
  });

  server.listen(process.env.SERVER_PORT, () => {
    console.log(`Rate limiting service running on: ${process.env.SERVER_PORT}`);
  });

};

main();
