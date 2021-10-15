const RATE_LIMITING_SERVER_BASE_URL = "http://localhost:8080";
const INTERREP_API_BASE_URL = "http://localhost:8084";
import { RedirectMessage } from "./types";
import axios from "axios";

const registerToInterRep = async (groupId: string, idCommitment: string) => {
  const result = await axios.post(
    `${INTERREP_API_BASE_URL}/register/${groupId}/${idCommitment}`
  );
  return result.data;
};

const getWitness = async (groupId: string, idCommitment: string) => {

    try {
  const result = await axios.get(
    `${RATE_LIMITING_SERVER_BASE_URL}/users/witness/${groupId}/${idCommitment}`
  );

  return result.data.data;
    } catch(e) {
        return {"error": "Error while obtaining witness"};
    }

};

const accessApp = async (request: RedirectMessage) => {
  const res = await axios.post(
    `${RATE_LIMITING_SERVER_BASE_URL}/users/access`,
    request
  );
  return res.data;
};

export { registerToInterRep, getWitness, accessApp };
