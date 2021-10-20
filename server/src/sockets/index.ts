import { Server, Socket } from "socket.io";
import {SocketEventType} from "../utils/types"
import http from "http";

import {
    merkleTreeController,
  } from "../controllers";


const initServer =  async (server: http.Server): Promise<Server> => {
    const io = new Server(server);
    return io;
}

const setSocketListeners = async (server: Server) => {
    console.log("setting socket listeners...",)

    server.on("connection", async (socket: Socket) => {
      console.log("on connection...")
        socket.emit("connected");

        socket.on(SocketEventType.GET_WITNESS, async (groupId: string, idCommitment: string, callback) => {
          try {
            const witness = await merkleTreeController.retrievePath(groupId, idCommitment)
            callback({
              status: "success",
              witness
            });
          } catch (e: any) {
            callback({
                status: "error",
                reason: e.statusText,
              });
          }
        });

        socket.on("disconnect", (reason) => {
          console.log("user disconnected:", reason);
        });
      });

}


export {
    initServer, setSocketListeners
}