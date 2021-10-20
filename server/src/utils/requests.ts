import axios from "axios";
import config from "../config"
import { getGroupMetadata, getAllLeaves, getGroups } from "./interRepSubgraphQueries"


const getLeaves = async () => {
  const result = await axios.get(`${config.INTERREP_MOCK_BASE_URL}/leaves`);
  return result.data;
};


const getInterrepGroups = async () => {

  const query = {"query": getGroups()};
  const result = await axios.post(`${config.INTERREP_SUBGRAPH_URL}`, query);
  return result.data.data;

};

const getInterrepGroupMetadata = async (groupId: string) => {

  const query = {"query": getGroupMetadata(groupId)};

  const result = await axios.post(`${config.INTERREP_SUBGRAPH_URL}`, query);
  return result.data.data;

};

const getInterRepLeaves = async (groupId: string, first: number = 100, skip: number = 0) => {

  const query = {"query": getAllLeaves(groupId, first, skip)};

  const result = await axios.post(`${config.INTERREP_SUBGRAPH_URL}`, query);
  return result.data.data;

}


export { getLeaves, getInterrepGroupMetadata, getInterRepLeaves, getInterrepGroups };
