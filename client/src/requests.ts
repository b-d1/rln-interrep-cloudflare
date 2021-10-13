import axios from "axios";
import { RedirectMessage } from "./types";


const getInterRepUserStatus = async (idCommitment: BigInt): Promise<boolean> => {

const provider = process.env.INTERREP_PROVIDER;
const groupId = process.env.INTERREP_GROUP_ID;

const result = await axios.get(`${process.env.INTERREP_API_BASE_URL}/groups/${provider}/${groupId}/${idCommitment.toString()}/check`);
const exists = result.data.data;
console.log("user exists", exists)
return exists;

}

const registerToInterRepGroup = async (idCommitment: BigInt): Promise<string> => {

// /api/groups/:provider/:name/:identityCommitment

  const provider = process.env.INTERREP_PROVIDER;
  const groupId = process.env.INTERREP_GROUP_ID;
  const oauthToken = process.env.OAUTH_TOKEN;
try {
  const result = await axios.post(`${process.env.INTERREP_API_BASE_URL}/groups/${provider}/""/${idCommitment.toString()}`, undefined, {headers: {'Authorization': `token ${oauthToken}`}});
  const rootHash = result.data.data;
  console.log("root hash", rootHash)
  return rootHash;
} catch(e) {
  console.log("error", e);
  return "";
}
};

const getInterRepWitness = async (idCommitment: BigInt) => {
    const provider = process.env.INTERREP_PROVIDER;
    const groupId = process.env.INTERREP_GROUP_ID;

    const result = await axios.get(`${process.env.INTERREP_API_BASE_URL}/groups/${provider}/${groupId}/${idCommitment.toString()}/path`);
    const witness = result.data.data;
    console.log("witness", witness)
    return witness;
}

const accessApp = async (request: RedirectMessage) => {
    const res = await axios.post(
        `${process.env.RATE_LIMITING_SERVICE_BASE_URL}/users/access`,
        request
      );
      return res.data;
}

export {
    getInterRepUserStatus,
    registerToInterRepGroup,
    getInterRepWitness,
    accessApp
}