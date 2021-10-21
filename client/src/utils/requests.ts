import config from "../config";

import { RedirectMessage } from "./types";
import axios from "axios";

const registerToInterRep = async (groupId: string, idCommitment: string) => {
  const result = await axios.post(
    `${config.INTERREP_MOCK_BASE_URL}/register/${groupId}/${idCommitment}`
  );
  return result.data;
};

const getWitness = async (groupId: string, idCommitment: string) => {
  try {
    const result = await axios.get(
      `${config.RATE_LIMITING_SERVICE_BASE_URL}/users/witness/${groupId}/${idCommitment}`
    );

    return result.data.data;
  } catch (e) {
    return { error: "Error while obtaining witness" };
  }
};

const accessApp = async (request: RedirectMessage) => {
  const res = await axios.post(
    `${config.RATE_LIMITING_SERVICE_BASE_URL}/users/access`,
    request
  );
  return res.data;
};

const getRlnIdentifierForApp = async (appName: string): Promise<bigint> => {
  const res = await axios.get(
    `${config.RATE_LIMITING_SERVICE_BASE_URL}/apps/${appName}`
      );
  const appData = res.data;
  return BigInt(appData.rlnIdentifier);
};

export { registerToInterRep, getWitness, accessApp, getRlnIdentifierForApp };
