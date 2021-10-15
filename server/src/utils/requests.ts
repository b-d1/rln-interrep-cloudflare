import axios from "axios";
const INTERREP_API_BASE_URL = "http://localhost:8084";

const getLeaves = async (groupId: string) => {
  const result = await axios.get(`${INTERREP_API_BASE_URL}/leaves/${groupId}`);
  return result.data;
};

export { getLeaves };
