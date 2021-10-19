import config from "../config"
import axios from "axios";



const getLeaves = async (groupId: string) => {
  const result = await axios.get(`${config.INTERREP_MOCK_BASE_URL}/leaves/${groupId}`);
  return result.data;
};

export { getLeaves };
