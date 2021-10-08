import axios from "axios";
const INTERREP_API_BASE_URL = "http://localhost:8084";

const getLeaves = async () => {
  const result = await axios.get(`${INTERREP_API_BASE_URL}/leaves`);
  return result.data;
};

export { getLeaves };
