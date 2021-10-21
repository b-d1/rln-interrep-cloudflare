import config from "../config";
import { io, Socket } from "socket.io-client";

import { SocketEventType } from "../utils/types";

const state = {
  connected: false,
  index: 0,
  witness: {},
  idCommitment: "",
  groupId: "",
};

// init socket, connect to server
console.log("initing socket...");
const socket = io(config.RATE_LIMITING_SERVICE_BASE_WS_URL);

const initState = (groupId: string, idCommitment: string) => {
  state.groupId = groupId;
  state.idCommitment = idCommitment;
};

const waitForConnection = (): Promise<boolean> => {
  console.log("waiting for connection...");
  return new Promise((resolve) => {
    socket.on("connect", () => {
      state.connected = true;
      resolve(true);
    });
  });
};

socket.on("connect", async () => {
  state.connected = true;
});

socket.on(SocketEventType.USER_REGISTERED, async (groupId: string) => {
  console.log("new user registered, groupId:", groupId);
  if (groupId === state.groupId) {
    try {
      const witness = await getWitness();
      state.witness = witness;
    } catch (e) {
      console.log("Error while obtaining witness, exiting!", e);
      process.exit(1);
    }
  }
});

socket.on(
  SocketEventType.USER_SLASHED,
  async (groupId: string, idCommitment: string) => {
    console.log("user was slashed, groupId:", groupId);
    if (groupId === state.groupId && idCommitment !== state.idCommitment) {
      try {
        const witness = await getWitness();
        state.witness = witness;
      } catch (e) {
        console.log("Error while obtaining witness, exiting!", e);
        process.exit(1);
      }
    }
  }
);

const getWitness = async (): Promise<{}> => {
  return new Promise((resolve, reject) => {
    socket.emit(
      SocketEventType.GET_WITNESS,
      state.groupId,
      state.idCommitment,
      async (response) => {
        if (response.status === "success") {
          console.log("new witness obtained successfully");
          resolve(response.witness);
        } else {
          reject(response);
        }
      }
    );
  });
};

const getState = () => {
  return state;
};

export { waitForConnection, getWitness, initState, getState };
