import express from "express";
import http from "http";
import { sync } from "./interrep_sync";
import { initDb } from "./db";
import { userRouter, appRouter } from "./api";
import {merkleTreeController} from "./controllers";
import dotenv from 'dotenv';

dotenv.config();


const syncLoop = async (interval: number = 60 * 1000) => {
  console.log("syncing...")
  await sync();
  setInterval(async () => {
    console.log("syncing loop...")
   await sync();
  }, interval)

}

const main = async () => {
  // init express and SocketIO
  const app = express();

  const server = http.createServer(app);

  await initDb();
  // seed zeroes if necessary
  await merkleTreeController.seedZeros()

  app.use(express.json());

  app.use("/users", userRouter);
  app.use("/apps", appRouter);

  app.get("/", (req, res) => {
    res.send("<h1>Welcome to cloudflare rate limiting service.</h1>");
  });

  server.listen(process.env.SERVER_PORT, () => {
    console.log(`Rate limiting service running on: ${process.env.SERVER_PORT}`);
  });

  syncLoop();

};

main();
